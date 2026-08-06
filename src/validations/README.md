# validations/

Esquemas **Zod** de cada formulario. Fuente única de verdad para:
validación en runtime, tipos TypeScript inferidos (`z.infer`) y mensajes de error.
Consumidos por React Hook Form vía `@hookform/resolvers/zod`.

Se añaden por fase junto con cada formulario (auth, medicamento, cita, síntoma, etc.).
