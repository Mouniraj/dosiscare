# DosisCare — Dev Build y pruebas en dispositivo

Varias funciones usan **módulos nativos** que **no** corren en Expo Go: hay que
generar un **Development Build** (dev client). Este documento explica cómo.

## ¿Por qué un dev build?

| Función | Módulo nativo | ¿Expo Go? |
|---|---|---|
| Base de datos local | `expo-sqlite` | ⚠️ limitado |
| Tokens/sesión | `expo-secure-store` | ❌ |
| Notificaciones locales | `expo-notifications` | ❌ (SDK 53+) |
| Selector fecha/hora | `@react-native-community/datetimepicker` | ❌ |
| Cámara/galería (escaneo) | `expo-image-picker` | ⚠️ |
| Cripto (hash) | `expo-crypto` | ✅ |

Para probar todo con fidelidad, usa un dev build en un dispositivo o emulador.

---

## Requisitos

- **Node 18+** y el repo con dependencias instaladas (`npm install`).
- **Cuenta Expo** (gratis) para builds en la nube con EAS.
- Para build local:
  - **Android**: Android Studio + SDK, un emulador o dispositivo con depuración USB.
  - **iOS**: solo en macOS, con Xcode.
- CLI: `npm i -g eas-cli` (o usar `npx eas-cli`).

> Nota: el árbol tiene un desajuste de peers conocido (react 19.2.3 / react-dom 19.2.8).
> Si algún install falla con `ERESOLVE`, usa `npm install --legacy-peer-deps`.

---

## Opción A — Build en la nube (EAS, recomendado)

```bash
# 1. Autenticar
npx eas-cli login

# 2. Configurar el proyecto (crea eas.json si no existe)
npx eas-cli build:configure

# 3. Build de desarrollo (incluye el dev client)
npx eas-cli build --profile development --platform android   # o ios
```

Perfil `development` sugerido en `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

Al terminar, EAS da un enlace/QR para instalar el `.apk`/`.ipa` en el dispositivo.

## Opción B — Build local

```bash
# Genera las carpetas nativas android/ e ios/ (prebuild)
npx expo prebuild

# Android (dispositivo/emulador conectado)
npx expo run:android

# iOS (solo macOS)
npx expo run:ios
```

`expo prebuild` aplica los *config plugins* ya declarados en `app.json`
(p. ej. el de `@react-native-community/datetimepicker`).

---

## Arrancar el servidor de desarrollo

Con el dev build instalado en el dispositivo:

```bash
npm start        # = expo start (Metro)
```

Abre la app dev‑client instalada y conéctala al servidor (mismo Wi‑Fi, o `--tunnel`).

---

## Checklist de pruebas en dispositivo

### Sesión y datos (SQLite + Secure Store)
- [ ] Login demo: `ana.martinez@gmail.com` / `123456`.
- [ ] Cerrar la app y reabrir → la sesión persiste (Secure Store).
- [ ] Crear persona/mascota/medicamento → reabrir → siguen ahí (SQLite).
- [ ] Modo invitado y registro nuevo.

### Pickers de fecha/hora
- [ ] En "Nuevo medicamento" → **Hora de inicio** abre el reloj nativo.
- [ ] En "Nueva cita" → **Fecha** y **Hora** abren los selectores nativos.
- [ ] El valor mostrado se localiza según el idioma (Ajustes → Idioma).

### Notificaciones (`expo-notifications`)
- [ ] Ajustes → **Recordatorios** ON → aceptar el permiso del sistema.
- [ ] Si se rechaza el permiso → aparece el toast "Activa las notificaciones…".
- [ ] Con recordatorios ON, crear una cita futura y verificar que se programa
      (ver "Notificaciones programadas" en ajustes del sistema, o esperar el disparo).
- [ ] Reabrir la app → se re‑sincronizan las notificaciones al arrancar.

> Para probar rápido: crea un medicamento cuyo próximo horario sea en 1–2 minutos.
> `NotificationService.syncNotifications` programa la próxima dosis de cada medicamento activo.

### Escaneo de receta (`expo-image-picker`)
- [ ] Medicamento → **Agregar → Escanear receta** → **Tomar foto** pide permiso de cámara.
- [ ] **Elegir de la galería** pide permiso de galería.
- [ ] Tras elegir imagen → "Analizando con IA…" → el formulario se **precarga**
      (lectura **simulada**; ver `docs/AI_SCAN.md` para el endpoint real).

### Tema e i18n
- [ ] Ajustes → **Tema** Claro/Oscuro cambia toda la app.
- [ ] Ajustes → **Idioma** ES/EN/PT cambia textos y formato de fechas en vivo.
- [ ] Color de acento.

### Sincronización
- [ ] Menú → panel de **Sincronización** muestra "N cambios pendientes".
- [ ] **Sincronizar ahora** → toast "Sin conexión con el servidor" (aún sin backend).

---

## Calidad (en cualquier máquina, sin dispositivo)

```bash
npm run typecheck   # TypeScript estricto, sin errores
npm test            # Jest: 4 suites / 19 tests de lógica pura
```

---

## Problemas frecuentes

- **`ERESOLVE` al instalar**: añade `--legacy-peer-deps`.
- **Los tipos de rutas de Expo Router quedan obsoletos** tras añadir pantallas
  (errores `Href` en TS): borra `.expo/types/router.d.ts`, corre `npx expo start`
  ~20–30 s para regenerarlos, detén Metro y vuelve a `npm run typecheck`.
- **Notificaciones no disparan en emulador**: úsalas en dispositivo físico; en iOS
  requieren permisos y no funcionan en el simulador para push (sí para locales).
- **Cambios nativos no aplican**: vuelve a correr `npx expo prebuild` / `run:android`.
