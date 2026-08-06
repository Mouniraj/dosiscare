# DosisCare — Análisis técnico previo (Fase 0)

> Documento de análisis del prototipo `DosisCare.dc.html` antes de escribir código.
> Objetivo: convertir el prototipo HTML estático en una app **React Native (Expo) + TypeScript, Offline‑First con SQLite**, escalable y mantenible.
>
> **Estado:** propuesta para aprobación. No se ha escrito código de la app todavía.

---

## 0. Resumen ejecutivo

DosisCare es una app de **gestión de salud familiar** (personas y mascotas): medicamentos con recordatorios, citas médicas/veterinarias, síntomas, seguimiento clínico (tensión/laboratorio), vacunas, historial de dosis y cuidado compartido entre cuidadores. Multi‑idioma (ES/EN/PT) y tema claro/oscuro.

El prototipo es un **único archivo** (`DosisCare.dc.html`, ~263 KB) renderizado por un runtime propio basado en React (`support.js`, framework generado — **no es código de la app**, es el motor del prototipo). Toda la lógica y los datos de ejemplo viven como estado en memoria de un solo componente. Nuestra tarea es **descomponer** eso en una arquitectura limpia con persistencia real en SQLite.

---

## 1. Pantallas detectadas

| # | Pantalla | Función | Navegación |
|---|----------|---------|------------|
| 1 | Splash | Bienvenida con logo | Stack raíz → Auth |
| 2 | Login | Correo + contraseña | Auth stack |
| 3 | Registro | Alta de cuenta | Auth stack |
| 4 | Recuperar contraseña | 3 pasos: email → código → nueva clave | Auth stack (sub‑flujo) |
| 5 | Onboarding | Configura tu cuenta (nombre + rol) | Auth → App (primera vez) |
| 6 | Inicio / Dashboard | Tira semanal + alarmas del día + próxima dosis | Tab |
| 7 | Personas (lista) | Tarjetas de perfiles de personas | Tab |
| 8 | Alta/edición de persona | Nombre, edad, peso, altura, alergias, rol, color, foto | Stack (modal/sheet) |
| 9 | Perfil de persona | Medicamentos, citas, síntomas del perfil | Stack |
| 10 | Alta/edición/detalle de medicamento | Manual o "escanear receta (IA)" | Stack + BottomSheet |
| 11 | Alta/edición/detalle de cita | Médico, persona, fecha/hora, avisos | Stack + BottomSheet |
| 12 | Alta/edición/detalle de síntoma | Chips + temperatura + nota | Stack + BottomSheet |
| 13 | Mascotas (lista) | Tarjetas de mascotas | Tab |
| 14 | Alta de mascota | Tipo, raza, edad, peso, color, foto | Stack |
| 15 | Perfil de mascota | Vacunas, medicamentos, citas veterinarias | Stack |
| 16 | Cuidados / Calendario | Vistas Día · Semana · Mes | Tab |
| 17 | Seguimiento clínico | Tensión/glucosa/personalizados + recordatorio | Sub‑vista de Cuidados |
| 18 | Vacunas (personas) | Agenda de vacunas por persona | Sub‑vista de Cuidados |
| 19 | Historial | Dosis pasadas + filtros (estado/persona) | Stack (desde Menú) |
| 20 | Menú | Acceso a todas las secciones | Tab |
| 21 | Ajustes | Sonidos por perfil, idioma, tema, sync, cerrar sesión | Stack (desde Menú) |
| 22 | Compartir cuidado | Cuidadores + invitar | Stack |

**Elementos transversales:** navegación inferior (5 tabs), FAB de alta rápida, modales de confirmación de borrado, hojas de detalle (BottomSheet), toasts de confirmación.

---

## 2. Componentes reutilizables

Extraídos por repetición visual en el prototipo:

**Primitivos UI**
`Button` (primary/secondary/ghost/danger) · `IconButton` / `ActionChip` (36×36: ver=azul, editar/duplicar=gris, eliminar=rojo) · `TextField` · `Select` · `Switch/Toggle` · `Chip` · `Badge` (estado: administrada/pendiente/programada) · `Avatar` (inicial + color de perfil) · `Card` · `Divider` · `SegmentedControl` (Día/Semana/Mes) · `Icon` (wrapper de Material Symbols).

**Composición**
`Header` · `BottomNav` (tabs) · `Fab` · `BottomSheet` · `ConfirmDialog` · `Toast` / `ToastProvider` · `WeekStrip` (tira semanal) · `ListItem` · `SearchBar` · `SectionHeader` · `EmptyState` · `Loader` · `SegmentedTabs`.

**Dominio**
`MedicationCard` · `AppointmentCard` · `SymptomCard` · `TrackingCard` · `VaccineCard` · `PersonCard` · `PetCard` · `CaregiverRow` · `HistoryRow` · `AlarmRow` · `DetailSheet` (plantilla común de hojas de detalle).

---

## 3. Flujo de navegación

```
RootNavigator (Stack)
├── SplashScreen
├── AuthStack (Stack)          → si no hay sesión
│   ├── Login
│   ├── Register
│   ├── ForgotPassword (email → code → newPass)
│   └── Onboarding             → tras registro / primer login
└── AppTabs (Bottom Tabs)      → si hay sesión
    ├── Home (Dashboard)
    ├── People  → PersonProfile → Med/Appt/Symptom (form/detail sheets)
    ├── Pets    → PetProfile    → Vaccine/Med/VetAppt (form/detail sheets)
    ├── Care (Calendar: Day/Week/Month + Tracking + Vaccines)
    └── Menu    → History, Settings, ShareCare
```

Deep Linking preparado: `dosiscare://person/:id`, `dosiscare://med/:id`, `dosiscare://appointment/:id`, etc. (útil para notificaciones que abren el registro concreto).

---

## 4. Arquitectura propuesta

Clean Architecture en capas, Offline‑First, con separación estricta UI ↔ dominio ↔ datos.

```
src/
├── api/                 # Axios: cliente + servicios remotos (preparado, sin backend aún)
├── assets/
├── components/          # UI reutilizable (primitivos + dominio)
├── constants/           # claves, enums, config app
├── contexts/            # solo cross-cutting no-datos (ej. ToastProvider)
├── database/
│   ├── connection/      # apertura SQLite, PRAGMA, singleton
│   ├── migrations/      # versionado de esquema
│   ├── repositories/    # Repository Pattern — TODO el SQL vive aquí
│   ├── queries/         # SQL como constantes tipadas
│   └── models/          # entidades de dominio (interfaces TS)
├── hooks/               # hooks custom (useMedications, useSync…)
├── navigation/          # navigators + linking
├── screens/             # pantallas (solo composición + hooks)
├── services/            # lógica de dominio (Auth, Notifications, Sync…)
├── store/               # Zustand (session, ui, settings)
├── theme/               # tokens de diseño (colores, tipografía, spacing)
├── types/               # tipos compartidos, DTOs
├── utils/               # helpers puros (fechas, formato, dosis)
└── validations/         # esquemas Zod
```

**Reglas de flujo de datos**
- Las **pantallas** no tocan SQL ni Axios. Usan **hooks** (React Query) que llaman a **repositorios**.
- **React Query** es la caché/estado de servidor sobre la fuente local: `queryFn` lee del **repositorio SQLite**, las `mutation` escriben en SQLite y marcan la fila como *pendiente de sincronizar*.
- **Zustand** guarda solo estado de app no persistente-por-fila: sesión activa, perfil seleccionado, idioma, tema, filtros de UI.
- **Axios** vive tras `services/*Service.ts`; hoy son stubs, mañana endpoints. La cola de sincronización consume estos servicios.
- **Zod** valida en formularios (React Hook Form) y también los DTOs de API.

**Principios:** SOLID, DRY, KISS, Separation of Concerns. Cada repositorio = una entidad. Cada servicio = una responsabilidad. Sin `any`. Sin SQL en pantallas. Sin lógica en componentes visuales.

---

## 5. Modelo de base de datos SQLite

Columnas de sincronización presentes en **todas** las tablas de dominio:

| Columna | Tipo | Uso |
|---------|------|-----|
| `id` | TEXT (UUID) | PK local, estable offline |
| `server_id` | TEXT NULL | id asignado por el backend tras sync |
| `sync_status` | TEXT | `pending` \| `synced` \| `updated` \| `deleted` \| `error` |
| `updated_at` | INTEGER | epoch ms, para resolución de conflictos |
| `created_at` | INTEGER | epoch ms |
| `deleted_at` | INTEGER NULL | **soft delete** (nunca borrado físico hasta confirmar sync) |

### Tablas

- **users** — `id, email, name, role, password_hash, avatar, + sync`
- **profiles** (personas) — `id, user_id(FK), name, age_num, weight, height, allergy, role, color, initial, photo, is_owner, + sync`
- **medications** — `id, owner_type('person'|'pet'), owner_id, name, form('pill'|'syrup'|'capsule'|'drops'|'injection'), dose, interval_hours, start_time, duration_days, treatment_kind('permanent'|'temporary'), start_date, icon, is_active, + sync`
- **appointments** — `id, profile_id(FK), doctor, date, time, remind_day, remind_hour, remind_at, notes, + sync`
- **symptoms** — `id, profile_id(FK), logged_at, items(JSON), custom(JSON), temperature, temp_unit('C'|'F'), note, + sync`
- **pets** — `id, user_id(FK), name, animal_type, breed, age, age_unit('y'|'m'), weight, color, initial, photo, + sync`
- **pet_vaccines** — `id, pet_id(FK), name, date, alarm, + sync`
- **vet_appointments** — `id, pet_id(FK), vet, date, time, description, + sync`
- **person_vaccines** — `id, profile_id(FK), name, date, reminder('daily'|'weekly'|'monthly'|'once'), + sync`
- **tracking_records** (seguimiento clínico) — `id, profile_id(FK), type('blood_pressure'|'glucose'|custom), value, recorded_at, reminder, + sync`
- **dose_history** — `id, medication_id(FK), profile_id(FK), scheduled_at, actual_at, caregiver_id, status('administered'|'postponed'|'skipped'), + sync`
- **caregivers** — `id, profile_id(FK), name, role, tag('owner'|'active'), invited_email, + sync`
- **settings** — `key, value` (idioma, tema, acento, estado sync) — tabla clave/valor
- **profile_sounds** — `profile_id(FK), sound('bell'|'chime'|'digital')`
- **sync_queue** — `id, entity, entity_id, operation('create'|'update'|'delete'), payload(JSON), attempts, last_error, created_at`

Índices en todas las FK y en `sync_status` para escaneos de la cola.

---

## 6. Entidades detectadas

User · Profile (persona) · Pet · Medication · Appointment · Symptom · PersonVaccine · PetVaccine · VetAppointment · TrackingRecord · DoseHistory · Caregiver · Setting · ProfileSound. (Confirmadas contra el seed real del prototipo: `profiles`, `meds`, `appts`, `sym`, `pets`, `vaccines`, `vetAppts`, `accounts`, `caregivers`, `sounds`.)

---

## 7. Relaciones entre tablas

```
User 1─────* Profile 1─────* Medication
                   1─────* Appointment
                   1─────* Symptom
                   1─────* PersonVaccine
                   1─────* TrackingRecord
                   1─────* Caregiver
                   1─────1 ProfileSound
     1─────* Pet   1─────* PetVaccine
                   1─────* VetAppointment
                   1─────* Medication (owner_type='pet')
Medication 1───* DoseHistory *───1 Caregiver (responsable)
```

Medication es polimórfica (`owner_type`/`owner_id`) para servir a personas y mascotas sin duplicar tabla. DoseHistory es el registro derivado del cumplimiento de las alarmas.

---

## 8. Repositorios necesarios

`UserRepository` · `ProfileRepository` · `PetRepository` · `MedicationRepository` · `AppointmentRepository` · `SymptomRepository` · `PersonVaccineRepository` · `PetVaccineRepository` · `VetAppointmentRepository` · `TrackingRepository` · `DoseHistoryRepository` · `CaregiverRepository` · `SettingsRepository` · `SyncQueueRepository`.

Cada uno extiende un `BaseRepository<T>` genérico con `findAll / findById / create / update / softDelete / markSynced`, encapsulando el marcado de `sync_status`. **Todo el SQL queda aquí; jamás en pantallas.**

---

## 9. Servicios necesarios

- **AuthService** — login/registro/recuperación contra SQLite hoy; contra API mañana. Token en Expo Secure Store.
- **PatientService / MedicationService / AppointmentService / SymptomService / PetService / TrackingService** — fachadas de dominio que orquestan repositorio + reglas + cola de sync.
- **NotificationService** — Expo Notifications: programar alarmas de dosis, citas y vacunas; cancelar/reprogramar.
- **SettingsService** — idioma, tema, acento, sonidos.
- **SyncService** — motor de la `sync_queue`: detecta conectividad, empuja cambios `pending`, aplica respuesta del servidor, resuelve conflictos por `updated_at`.
- **ScanService** (IA de recetas) — hoy **simulado** (mock que devuelve medicamento/dosis/frecuencia); interfaz lista para OCR/IA real.
- **ImageService** — Expo Image Picker + FileSystem para fotos de perfil/mascota/receta.

Cada servicio es independiente e inyectable (facilita test y sustitución).

---

## 10. Riesgos técnicos

1. **Alarmas exactas en segundo plano** — Expo Notifications tiene límites en Android (Doze) e iOS para disparos exactos y repetitivos; medicación crítica exige fiabilidad. Mitigación: reprogramación al abrir la app + evaluar `notifee`/canales Android si Expo Go no basta (requiere dev build).
2. **Sincronización sin backend definido** — el contrato de API no existe. Riesgo de rehacer la capa sync al aparecer el servidor. Mitigación: DTOs + adaptadores desacoplados; la cola es agnóstica al transporte.
3. **Fidelidad visual** — el prototipo usa HTML/CSS (flex, gradients, Material Symbols). Traducir 1:1 a RN (sin CSS) requiere cuidado con sombras, gradientes (`expo-linear-gradient`) e iconos (fuente de iconos en RN).
4. **Fechas/zonas horarias** — intervalos de dosis (`h`), duración (`days`) y recordatorios necesitan aritmética de fechas robusta y consistente offline.
5. **Migraciones** — evolución del esquema en dispositivos con datos ya cargados; requiere sistema de migraciones versionado desde el día 1.
6. **Multi‑idioma dinámico** — ES/EN/PT ya viven en el prototipo; hay que extraer ~cientos de cadenas a i18n sin romper el diseño.
7. **Fotos e imágenes** — almacenamiento (FileSystem) vs. base64 en SQLite; decidir para no inflar la BD.

---

## 11. Mejoras UX/UI propuestas (sin alterar el diseño)

- Estados de carga y *skeletons* reales (el prototipo asume datos instantáneos).
- Estados vacíos accionables (`EmptyState` con CTA) en cada lista.
- Accesibilidad: `accessibilityLabel`, tamaños táctiles ≥44px, contraste verificado en ambos temas.
- Feedback offline explícito (badge "sin conexión / cambios pendientes de sincronizar").
- Confirmación de deshacer (undo) en toasts de borrado, además del modal.
- Persistencia del idioma/tema antes del primer render (evitar parpadeo).

> Ninguna de estas cambia colores, tipografías, espaciados ni iconografía del prototipo; son añadidos de estado/robustez.

---

## 12. Posibles inconsistencias del prototipo

- **`age` de personas vs. mascotas**: personas usan `ageNum` (número); mascotas usan `age` + `ageUnit` ('y'/'m'). Se normaliza en el modelo.
- **Medicamento sin `treatment_kind` explícito en el seed de personas**: se infiere de `perm` (permanente) y `days` (duración). El formulario de alta sí distingue permanente/temporal.
- **`who` en citas** apunta a un **índice** de array, no a un id estable → frágil. Se sustituye por FK `profile_id`.
- **Seguimiento, vacunas de persona e historial**: descritos en la documentación pero parcialmente **derivados/simulados** en el prototipo (no todos tienen array semilla). Se modelan como tablas propias de primera clase.
- **Contraseñas en claro** en `accounts` (`pass:'123456'`) — solo demo. En la app: hash + Secure Store, nunca texto plano.
- **Nota de la doc**: la sección "Notificaciones" se retiró y los sonidos viven ahora dentro de Ajustes › General (respetar esa ubicación).

---

## 13. Plan de desarrollo por fases

> Trabajaremos **iteración a iteración**, con tu aprobación entre cada una.

- **Fase 1 — Cimientos**: scaffold Expo + TS + NativeWind, estructura de carpetas, `theme/` con los tokens exactos (ver Anexo A), navegación base vacía, conexión SQLite + sistema de migraciones + `BaseRepository`. *Entregable: app arranca, BD abre, tema aplicado.*
- **Fase 2 — Componentes UI**: librería de primitivos y componentes de dominio, fieles al prototipo, en Storybook-like/pantalla de catálogo.
- **Fase 3 — Autenticación**: Splash, Login, Registro, Recuperar, Onboarding con RHF + Zod + AuthService + Secure Store (local).
- **Fase 4 — Personas y Medicamentos**: CRUD completo sobre SQLite (repos + hooks + pantallas), incluye alta manual y detalle. Escaneo IA simulado.
- **Fase 5 — Citas y Síntomas**: CRUD + hojas de detalle + recordatorios (NotificationService).
- **Fase 6 — Mascotas**: perfiles, vacunas, medicamentos y citas veterinarias.
- **Fase 7 — Cuidados/Calendario**: vistas Día/Semana/Mes, seguimiento clínico y vacunas de persona.
- **Fase 8 — Historial y Compartir cuidado**: filtros, cuidadores.
- **Fase 9 — Ajustes e i18n**: idioma ES/EN/PT, tema, sonidos por perfil, acento.
- **Fase 10 — Sincronización**: SyncService + sync_queue + estados + preparación de la capa API.
- **Fase 11 — Pulido**: accesibilidad, estados de carga/vacío/offline, pruebas.

---

## Anexo A — Tokens de diseño extraídos (fieles al prototipo)

**Tema claro**
`canvas #c9d3e0` · `bg #eef2f8` · `surface #ffffff` · `navBg #ffffff` · `text #182031` · `textVar #5a6577` · `outline #e4e9f1` · `primary #2f6bed` · `primaryContainer #dde8ff` · `greenContainer #d7f2e6`

**Tema oscuro**
`canvas #070a10` · `bg #0f141d` · `surface #182130` · `navBg #141c28` · `text #e8edf5` · `textVar #9aa6b8` · `outline #28303f` · `primary #8fb3ff` · `primaryContainer #1e2c48` · `greenContainer #123829`

**Semánticos / categorías**
`ok/verde #17a673` (texto sobre verde `#0a6b48`) · `danger #e5484d` / `#c62828` · `warn #c56a00` / `#f5931f` · `purple #7c5cff` · colores de perfil: azul `#2f6bed`, verde `#17a673`, naranja `#f5931f`, morado `#7c5cff`.

**Tipografía**: `Roboto Flex` (principal), `Roboto` (fallback), **Material Symbols Rounded** (iconos).
**Marco/escala de referencia**: teléfono 392×820, radios 36–46px, tarjetas radio 16–18px, chips de acción 36×36.

---

## Decisiones que necesito de ti antes de la Fase 1

1. **Navegación**: el brief menciona React Navigation **y** Expo Router. Recomiendo **Expo Router** (file-based, deep linking automático, encaja con Expo). ¿Lo confirmas o prefieres React Navigation clásico?
2. **Alcance de la Fase 1**: ¿arranco ya el scaffold (Expo + estructura + tema + SQLite/migraciones/BaseRepository) o quieres ajustar algo de este análisis primero?
3. **Plataforma objetivo y build**: ¿Android, iOS o ambas? ¿Expo Go es suficiente al inicio, o vamos directo a *dev build* (necesario para notificaciones/alarmas fiables)?
4. **Idioma por defecto** de la UI al primer arranque: ¿Español?
