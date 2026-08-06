# services/

Lógica de dominio, independiente de la UI. Cada servicio tiene una única
responsabilidad y orquesta repositorios + reglas + cola de sincronización.

Planificados (por fase):

- `AuthService` — login/registro/recuperación (SQLite hoy, API mañana) + Secure Store (Fase 3)
- `MedicationService`, `AppointmentService`, `SymptomService` (Fases 4–5)
- `PetService`, `TrackingService` (Fases 6–7)
- `NotificationService` — Expo Notifications: alarmas de dosis/citas/vacunas (Fase 5)
- `SyncService` — motor de `sync_queue`, conectividad, resolución de conflictos (Fase 10)
- `ScanService` — IA de recetas (simulada) (Fase 4)
- `ImageService` — Image Picker + FileSystem (según se necesite)
