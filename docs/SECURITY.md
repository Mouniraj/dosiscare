# DosisCare — Seguridad

Resumen de la postura de seguridad de la app y del *hardening* aplicado.

## Modelo de amenazas (resumen)

App **Offline-First** en el dispositivo. Los datos son de salud (medicamentos,
síntomas, alergias). Amenazas principales: acceso a un dispositivo desbloqueado,
extracción del archivo SQLite (root/backup/forense), y fuga de datos en la pantalla
de bloqueo. No hay backend todavía (la capa de red está stubbed).

## Controles implementados

### Autenticación local
- Contraseñas con **PBKDF2‑HMAC‑SHA256** (100 000 iteraciones, sal de 16 bytes),
  formato `pbkdf2$<iter>$<saltHex>$<hashHex>` — `src/utils/password.ts`.
  Cuentas antiguas en formato `salt:hash` (SHA‑256) siguen verificando (migración suave).
- **Comparación en tiempo constante** al verificar (sin canal lateral por timing).
- Tokens de sesión en **Expo Secure Store** (keystore/keychain), enviados como
  `Authorization: Bearer` — nunca en URLs. Claves centralizadas en `SECURE_KEYS`.

### Control de acceso
- **Guard de sesión global** (`src/hooks/useProtectedRoute.ts`, montado en el root
  layout): cualquier navegación sin sesión — incluidos **deep links** directos a
  `person/[id]`, `settings`, `history`, formularios… — redirige a login.
- **Scoping por usuario** en `ProfileService.get` / `PetService.get` (devuelven
  `null` si el registro no pertenece al usuario en sesión).

### Cifrado de datos de salud en reposo
- **AES‑256‑GCM** (autenticado) sobre los campos clínicos de texto libre, con clave
  de 256 bits generada en el primer arranque y guardada en **Secure Store**
  (`src/utils/dbKey.ts`). Núcleo puro y testeado en `src/utils/aesGcm.ts`; fachada
  con clave en memoria en `src/utils/fieldCrypto.ts` (`initFieldCrypto()` en el boot).
- Campos cifrados hoy: **síntomas** (`items`, `custom`, `note`), **alergias** de
  persona, **notas** de citas médicas y **descripción** de citas veterinarias.
  Formato `enc1:<nonceHex>:<ctHex>`; los valores sin ese prefijo (plaintext heredado)
  se leen tal cual (compatibilidad).
- No se cifran campos usados en filtros/orden (ids, fechas, `owner_id`) ni el nombre
  y dosis del medicamento (se muestran en muchas vistas; ver "pendiente").

### Higiene general (verificado)
- **SQL siempre parametrizado** (bindings `?`); identificadores de tabla/columna son
  constantes del código → sin inyección.
- **Sin secretos en el repo** (ni API keys ni tokens), sin `http://` inseguro, sin
  logging de secretos, sin `Math.random` para seguridad.
- Permisos de cámara/galería/notificaciones pedidos en **runtime**; validación de
  entrada con **Zod**; el escaneo con IA mantiene la API key **en el servidor**
  (`docs/AI_SCAN.md`).
- **Notificaciones**: cuerpos genéricos ("Tienes una toma pendiente") — no exponen
  medicamento/persona/médico en la pantalla de bloqueo.

## Pendiente / recomendaciones

| Ítem | Nota |
|---|---|
| **Cifrado de toda la BD** | El cifrado por campo cubre lo más sensible. Para cifrado total del archivo, migrar `expo-sqlite` → `@op-engineering/op-sqlite` con **SQLCipher** (clave desde Secure Store). Es un cambio nativo/mayor; ver §migración abajo. |
| Nombre/dosis de medicamento | Hoy en claro (se muestran en agenda/tarjetas). Cifrables con el mismo helper si se requiere. |
| Cuentas de invitado | Se acumulan sin limpieza; añadir purga o reutilización. |
| Recuperación de contraseña | Código demo `123456`; en producción, OTP del backend (`docs/API_CONTRACT.md`). |
| Cert pinning | Añadir al integrar el backend real. |
| iOS usage strings | Declarar `NSCameraUsageDescription` / `NSPhotoLibraryUsageDescription` en `app.json` antes de publicar. |
| Rotación de clave / borrado | Definir política de borrado de la clave de datos al cerrar sesión/desinstalar. |

### Migración a cifrado total (op-sqlite + SQLCipher)
1. Instalar `@op-engineering/op-sqlite`; abrir la BD con `encryptionKey` (hex desde
   `getOrCreateDbKey`).
2. Adaptar `src/database/connection` y `BaseRepository` a la API de op-sqlite
   (`execute(sql, params) → { rows }`).
3. Quitar el cifrado por campo (ya lo cubre SQLCipher) o mantenerlo como defensa en
   profundidad.
4. Requiere **dev build** (módulo nativo); verificar en dispositivo.

## Verificación
`npm run typecheck` (estricto) y `npm test` (incluye `aesGcm.test.ts`:
round‑trip, unicode/JSON, detección de manipulación y clave incorrecta) en verde.
