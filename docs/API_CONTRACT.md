# DosisCare — Contrato del API del Backend

> Documento de referencia para implementar el backend contra el que la app sincroniza.
> La app es **Offline‑First**: SQLite es la fuente de verdad y funciona sin conexión.
> El backend es opcional y solo se usa para **respaldo y sincronización multi‑dispositivo**.

Estado actual en la app: la capa de red está **cableada pero stub** (`src/api/`). Cada
servicio remoto lanza `BackendUnavailableError` hasta que exista este backend. Al
implementarlo, **no cambia la arquitectura del cliente**: solo se rellenan los cuerpos
de los stubs y se apunta `API_BASE_URL`.

---

## 1. Principios

- **La app nunca depende del backend para operar.** Todo CRUD ocurre primero en SQLite.
- El cliente empuja cambios locales pendientes cuando hay conexión y, opcionalmente,
  baja cambios del servidor (delta‑sync).
- **IDs**: el cliente genera un `id` UUID v4 local y estable. El servidor asigna un
  `server_id` propio y lo devuelve. El cliente guarda ambos (`id` local + `serverId`).
- **Timestamps**: epoch en **milisegundos** (enteros). `created_at`, `updated_at`,
  `deleted_at`.
- **Borrado**: *soft delete* (se marca `deleted_at` y `sync_status='deleted'`), se
  propaga al servidor, y tras confirmación el cliente hace *hard delete* local.

---

## 2. Convenciones HTTP

| Aspecto | Valor |
|---|---|
| Base URL | Configurable en el cliente vía `API_BASE_URL` (`src/constants/config.ts`) |
| Formato | `application/json; charset=utf-8` |
| Auth | `Authorization: Bearer <accessToken>` (inyectado por `setAuthToken` en `src/api/httpClient.ts`) |
| Timeout | 15 s (cliente) |
| Versionado | Prefijo `/v1` recomendado |
| Zona horaria | Todos los instantes en epoch ms UTC |

### Formato de error (uniforme)

```json
{ "error": { "code": "wrongPassword", "message": "La contraseña es incorrecta." } }
```

`code` es estable y legible por máquina. El cliente ya mapea los códigos de auth a
i18n en `src/i18n/authError.ts`:

| HTTP | `error.code` | Uso |
|---|---|---|
| 401 | `noAccount` | No existe cuenta con ese correo |
| 401 | `wrongPassword` | Contraseña incorrecta |
| 409 | `emailExists` | Correo ya registrado |
| 400 | `invalidCode` | Código de recuperación inválido |
| 4xx/5xx | `generic` | Cualquier otro error |

---

## 3. Autenticación

Reemplaza a `AuthService` (hoy local con hash SHA‑256 salteado + Expo Secure Store).
El cliente guarda el token en Secure Store y lo envía como Bearer.

### `POST /v1/auth/register`
```json
// request
{ "name": "Ana Martínez", "email": "ana@correo.com", "password": "••••••" }
// 201 response
{ "token": "jwt...", "refreshToken": "jwt...", "user": { "id": "srv_...", "email": "ana@correo.com", "name": "Ana Martínez", "role": "owner", "avatar": null } }
```

### `POST /v1/auth/login`
```json
// request
{ "email": "ana@correo.com", "password": "••••••" }
// 200 response  → misma forma que register (RemoteAuthResponse)
{ "token": "jwt...", "refreshToken": "jwt...", "user": { "id": "srv_...", "email": "...", "name": "...", "role": "owner", "avatar": null } }
```

### `POST /v1/auth/password/reset-request`
```json
{ "email": "ana@correo.com" }   // 204 (envía OTP por email; no revela si existe)
```

### `POST /v1/auth/password/reset`
```json
{ "email": "ana@correo.com", "code": "123456", "password": "nueva" }  // 204
```

### `POST /v1/auth/refresh`
```json
{ "refreshToken": "jwt..." }  // 200 → { "token": "jwt...", "refreshToken": "jwt..." }
```

> **Contrato del cliente** (`src/api/services/authApi.ts`): `login`, `register`,
> `requestPasswordReset`. Tipo esperado `RemoteAuthResponse = { token, user }`.

---

## 4. Recursos por entidad (REST)

Cada entidad expone CRUD estándar. El cliente ya define los stubs en
`src/api/services/*.ts` con la forma `list` / `create` / `update` / `remove`.

```
GET    /v1/{resource}?updatedSince=<epochMs>   → lista (delta pull)
POST   /v1/{resource}                          → crea  (devuelve server_id)
PATCH  /v1/{resource}/{serverId}               → actualiza
DELETE /v1/{resource}/{serverId}               → borra
```

Recursos y su servicio cliente:

| Recurso | Tabla local | Stub cliente | Pertenece a |
|---|---|---|---|
| `profiles` | `profiles` | `profileApi` | `user` |
| `pets` | `pets` | `petApi` | `user` |
| `medications` | `medications` | `medicationApi` | persona **o** mascota (`owner_type`/`owner_id`) |
| `appointments` | `appointments` | `appointmentApi` | `profile` |
| `person-vaccines` | `person_vaccines` | *(pendiente)* | `profile` |
| `pet-vaccines` | `pet_vaccines` | *(pendiente)* | `pet` |
| `vet-appointments` | `vet_appointments` | *(pendiente)* | `pet` |
| `symptoms` | `symptoms` | *(pendiente)* | `profile` |
| `dose-history` | `dose_history` | *(pendiente)* | medicamento + dueño |

> Cada `POST`/`PATCH` recibe el `id` **local** en el cuerpo para idempotencia
> (evita duplicados si el cliente reintenta). La respuesta incluye `server_id`.

### Envelope de creación/actualización

```json
// POST /v1/medications
{
  "clientId": "9f1c…local-uuid",
  "createdAt": 1785000000000,
  "updatedAt": 1785000000000,
  "data": { /* campos de la entidad, ver §6 */ }
}
// 201 → { "serverId": "srv_med_123", "updatedAt": 1785000000001 }
```

---

## 5. Sincronización delta (recomendado)

Además del CRUD por recurso, se recomienda un endpoint **bulk** que la app puede usar
para empujar todo lo pendiente y bajar novedades en una sola llamada. Encaja con
`SyncService.syncAll()` (`src/services/SyncService.ts`).

### `POST /v1/sync`

```json
// request — el cliente envía sus filas "sucias" (sync_status != 'synced')
{
  "lastSyncedAt": 1784990000000,
  "changes": {
    "medications": [
      { "clientId": "…", "op": "create", "data": { … }, "updatedAt": 1785000000000 },
      { "clientId": "…", "serverId": "srv_…", "op": "update", "data": { … }, "updatedAt": 1785000100000 },
      { "clientId": "…", "serverId": "srv_…", "op": "delete", "updatedAt": 1785000200000 }
    ],
    "appointments": [ … ]
  }
}
```

```json
// 200 response
{
  "serverTime": 1785000300000,
  "applied": [
    { "resource": "medications", "clientId": "…", "serverId": "srv_med_123" }
  ],
  "conflicts": [
    { "resource": "medications", "clientId": "…", "serverId": "srv_…", "server": { … } }
  ],
  "pull": {
    "medications": [ { "serverId": "srv_…", "data": { … }, "updatedAt": …, "deletedAt": null } ]
  }
}
```

**Aplicación en el cliente:**
- `applied` → `repo.markSynced(clientId, serverId)`.
- `conflicts` → resolver (ver §7) y volver a marcar.
- `pull` → upsert local por `serverId`; si `deletedAt != null` → `repo.hardDelete`.

`op` se deriva del `sync_status` local: `pending`→`create`, `updated`→`update`,
`deleted`→`delete`.

---

## 6. Esquemas de entidad (JSON ↔ modelo local)

Los campos siguen los modelos de `src/database/models/index.ts`. Todas las entidades
incluyen además la **metadata de sync** (`§6.0`).

### 6.0 Metadata común (`SyncMetadata`)
```jsonc
{
  "id": "uuid-local",          // PK local (clientId en la API)
  "serverId": "srv_…|null",
  "syncStatus": "pending|synced|updated|deleted|error",
  "createdAt": 1785000000000,  // epoch ms
  "updatedAt": 1785000000000,
  "deletedAt": null
}
```

### 6.1 `users`
```jsonc
{ "email": "string", "name": "string", "role": "owner|guest|string", "avatar": "string|null" }
```
> El backend nunca almacena contraseñas en claro; usa hash + sal server‑side.

### 6.2 `profiles` (personas)
```jsonc
{
  "userId": "fk", "name": "string", "ageNum": 3, "weight": 14, "height": 96,
  "allergy": "Penicilina|null", "role": "Hija|null",
  "color": "#2f6bed", "initial": "S", "photo": "uri|null", "isOwner": true
}
```

### 6.3 `pets`
```jsonc
{
  "userId": "fk", "name": "Rocky", "animalType": "dog|cat|bird|rabbit|fish|other",
  "breed": "string|null", "age": "4", "ageUnit": "y|m", "weight": 12,
  "color": "#7c5cff", "initial": "R", "photo": "uri|null"
}
```

### 6.4 `medications` (polimórfica: persona o mascota)
```jsonc
{
  "ownerType": "person|pet", "ownerId": "fk",
  "name": "Paracetamol Jarabe", "form": "pill|syrup|capsule|drops|injection",
  "dose": "5 ml", "intervalHours": 8, "startTime": "08:00",
  "durationDays": 5, "treatmentKind": "permanent|temporary",
  "startDate": "2026-08-05", "icon": "water-drop",
  "isActive": true, "status": "ok|due|administered|pending|scheduled"
}
```

### 6.5 `appointments` (citas médicas)
```jsonc
{
  "profileId": "fk", "doctor": "Dra. Ramírez", "date": "2026-08-07", "time": "11:30",
  "remindDay": true, "remindHour": true, "remindAt": false, "notes": "string|null"
}
```

### 6.6 `person_vaccines`
```jsonc
{ "profileId": "fk", "name": "Influenza", "date": "2026-09-01", "reminder": "once|daily|weekly|monthly" }
```

### 6.7 `pet_vaccines`
```jsonc
{ "petId": "fk", "name": "Rabia", "date": "2026-08-15", "alarm": true }
```

### 6.8 `vet_appointments`
```jsonc
{ "petId": "fk", "vet": "Dra. Laura Gómez", "date": "2026-08-10", "time": "11:00", "description": "string|null" }
```

### 6.9 `symptoms`
```jsonc
{
  "profileId": "fk", "loggedAt": 1785000000000,
  "items": ["fever", "headache"],   // claves i18n predefinidas
  "custom": ["mareo"],              // texto libre
  "temperature": 38.5, "tempUnit": "C|F", "note": "string|null"
}
```

### 6.10 `dose_history`
```jsonc
{
  "medicationId": "fk", "profileId": "ownerId (persona o mascota)",
  "scheduledAt": 1785000000000, "actualAt": 1785000123000,
  "caregiverId": "fk|null", "status": "administered|postponed|skipped"
}
```

### 6.11 `settings` (opcional, preferencias por usuario)
Clave/valor: `app.theme`, `app.language`, `app.accent`, `app.sound`,
`app.notifications`. Sincronizar es opcional (son locales al dispositivo).

---

## 7. Estados de sync y conflictos

| `sync_status` | Significado | Acción del backend |
|---|---|---|
| `pending` | Creado local, sin subir | `create` |
| `updated` | Sincronizado antes, cambió | `update` |
| `deleted` | Borrado local (soft) | `delete` + confirmar |
| `synced` | En sync | — |
| `error` | Último intento falló | reintentar |

**Resolución de conflictos (recomendada):** *last‑write‑wins* por `updatedAt`.
Si el `updatedAt` del servidor es mayor que el del cliente, gana el servidor y se
devuelve en `conflicts[].server` para que el cliente haga upsert. Alternativa más
estricta: servidor autoritativo siempre. Documentar la elegida aquí.

---

## 8. Puntos de integración en el cliente

| Qué | Dónde |
|---|---|
| Base URL | `src/constants/config.ts` → `API_BASE_URL` |
| Token Bearer | `src/api/httpClient.ts` → `setAuthToken()` |
| Auth real | `src/api/services/authApi.ts` (quitar `notImplemented`) |
| CRUD por recurso | `src/api/services/{profile,pet,medication,appointment}Api.ts` |
| Recursos faltantes | crear `personVaccineApi`, `petVaccineApi`, `vetAppointmentApi`, `symptomApi`, `doseHistoryApi` siguiendo el mismo patrón |
| Orquestación de sync | `src/services/SyncService.ts` (registrar los nuevos pushers) |
| Estado UI de sync | `src/store/syncStore.ts` |

Al implementar el backend, el flujo es: apuntar `API_BASE_URL`, rellenar `authApi`,
rellenar cada `*Api`, registrar los pushers restantes en `SyncService`, y (opcional)
cambiar `SyncService.syncAll()` para usar `POST /v1/sync` en vez de CRUD por recurso.
