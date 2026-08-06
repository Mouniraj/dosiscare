# DosisCare

Aplicación móvil **Offline-First** para la gestión de medicamentos, citas, síntomas y salud de la familia (personas y mascotas), con recordatorios, cuidado compartido, multi-idioma (ES/EN/PT) y tema claro/oscuro.

Convertida desde el prototipo `DosisCare.dc.html` a una app React Native profesional.

## Stack

- **Expo** (SDK 57) + **React Native** 0.86 (New Architecture)
- **TypeScript** (strict)
- **Expo Router** (navegación file-based + deep linking)
- **Expo SQLite** — fuente principal de datos (Offline-First)
- **React Query** (TanStack) — caché sobre SQLite
- **Zustand** — estado global (sesión, ajustes)
- **React Hook Form + Zod** — formularios y validación
- **NativeWind** (Tailwind) — estilos
- **Axios** — capa API (preparada para backend futuro)
- **Expo Secure Store / Notifications / Image Picker / File System**

## Arquitectura

```
app/                     # Rutas (Expo Router): (auth) y (app) tabs
src/
├── api/                 # Axios + React Query client
├── components/          # UI reutilizable
├── constants/           # Configuración y claves
├── contexts/            # Providers cross-cutting no-datos
├── database/
│   ├── connection/      # Singleton SQLite + PRAGMA
│   ├── migrations/      # Migraciones versionadas (user_version)
│   ├── repositories/    # Repository Pattern — TODO el SQL vive aquí
│   ├── queries/         # SQL como constantes tipadas
│   └── models/          # Entidades de dominio (TS)
├── hooks/               # Hooks custom (React Query + repos)
├── navigation/          # Config de linking
├── screens/             # Composición de pantallas
├── services/            # Lógica de dominio (Auth, Notifications, Sync…)
├── store/               # Zustand
├── theme/               # Tokens de diseño (fieles al prototipo)
├── types/               # Tipos compartidos (sync, DTOs)
├── utils/               # Helpers puros
└── validations/         # Esquemas Zod
```

**Regla de oro:** las pantallas nunca escriben SQL ni llaman a Axios directamente.
Fluyen por hooks → repositorios (SQLite) → SyncQueue → servicios API.

**Regla de oro:** las pantallas nunca escriben SQL ni llaman a Axios directamente.

## Documentación

- [`docs/ANALISIS.md`](docs/ANALISIS.md) — análisis del prototipo, modelo de datos y plan por fases.
- [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md) — contrato del backend (auth, CRUD por entidad, delta‑sync, esquemas JSON).
- [`docs/DEV_BUILD.md`](docs/DEV_BUILD.md) — cómo generar el development build y checklist de pruebas en dispositivo.
- [`docs/AI_SCAN.md`](docs/AI_SCAN.md) — contrato del escaneo de recetas con IA (endpoint, esquema de salida, seguridad).

## Desarrollo

```bash
npm install            # usa --legacy-peer-deps si aparece ERESOLVE
npm start              # Expo dev server (Metro)
npm run android        # Android
npm run ios            # iOS (requiere macOS)
npm run typecheck      # TypeScript estricto
npm test               # Jest (lógica pura): 4 suites / 19 tests
```

> Notificaciones, selectores de fecha/hora, cámara, SQLite y Secure Store requieren un
> **development build** (no Expo Go). Ver [`docs/DEV_BUILD.md`](docs/DEV_BUILD.md).

## Estado del proyecto

**Completo respecto al prototipo** + andamiaje de producción: autenticación, personas,
mascotas, medicamentos, agenda/cuidados, historial de dosis, vacunas y citas
veterinarias, síntomas, ajustes + i18n (ES/EN/PT), tema claro/oscuro, notificaciones
locales, selectores nativos de fecha/hora, escaneo de recetas (IA simulada) y capa de
sincronización (lista para backend). `npm run typecheck` y `npm test` en verde.

Pendiente (dependencias externas): backend real, endpoint de IA/visión con API key, y
verificación en dispositivo vía dev build.
