# DosisCare — Escaneo de receta con IA

Contrato para convertir una **foto de receta** en un **borrador de medicamento** que
precarga el formulario. Hoy está **simulado**; este documento define el endpoint real.

## Estado en la app

- Pantalla: `app/scan-prescription.tsx` — toma/elige foto (`expo-image-picker`),
  muestra "Analizando con IA…" y navega al formulario ya precargado.
- Handoff: `src/store/scanDraftStore.ts` (borrador de un solo uso).
- Servicio: `src/services/PrescriptionScanService.ts` → **único punto de integración**.

```ts
// Hoy (stub): simula 1.5 s y devuelve un borrador fijo.
export const PrescriptionScanService = {
  async scan(imageUri: string): Promise<MedicationFormValues> { … }
};
```

`MedicationFormValues` (todos strings, listos para el formulario):
```ts
{
  name: string;                         // "Amoxicilina"
  form: 'pill'|'syrup'|'capsule'|'drops'|'injection';
  dose: string;                         // "500 mg"
  intervalHours: string;                // "8"
  startTime: string;                    // "08:00"
  durationDays: string;                 // "7"
  treatmentKind: 'temporary'|'permanent';
}
```

---

## Seguridad (importante)

**Nunca** pongas la API key de un modelo (Anthropic, OpenAI, etc.) en la app cliente:
es extraíble del bundle. La imagen debe ir a **tu backend**, que llama al modelo con
la key server‑side y devuelve JSON estructurado. La app solo habla con tu backend.

```
App ──(imagen)──▶ Backend ──(imagen + prompt)──▶ Modelo de visión ──(JSON)──▶ Backend ──▶ App
```

Esto además respeta el modelo Offline‑First: sin conexión, el botón "Escanear" puede
avisar que requiere red, mientras "Agregar manualmente" sigue funcionando.

---

## Endpoint recomendado

### `POST /v1/ai/prescription`

Subida como `multipart/form-data` (campo `image`) **o** JSON con base64.

```jsonc
// respuesta 200 — un array porque una receta puede tener varios fármacos
{
  "medications": [
    {
      "name": "Amoxicilina",
      "form": "pill",
      "dose": "500 mg",
      "intervalHours": 8,
      "startTime": "08:00",
      "durationDays": 7,
      "treatmentKind": "temporary",
      "confidence": 0.86
    }
  ],
  "warnings": ["Horario de inicio inferido, confírmalo"]
}
```

El cliente mapea el primer elemento (o deja elegir si hay varios) a
`MedicationFormValues` convirtiendo los numéricos a string:

```ts
async scan(imageUri: string): Promise<MedicationFormValues> {
  const form = new FormData();
  form.append('image', { uri: imageUri, name: 'rx.jpg', type: 'image/jpeg' } as any);
  const { data } = await httpClient.post('/v1/ai/prescription', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const m = data.medications[0];
  return {
    name: m.name, form: m.form, dose: m.dose,
    intervalHours: String(m.intervalHours), startTime: m.startTime,
    durationDays: String(m.durationDays), treatmentKind: m.treatmentKind,
  };
}
```

---

## Lado servidor: prompt + esquema de salida

Usa un modelo de visión con **salida estructurada** (tool/JSON schema). Ejemplo de
contrato de herramienta:

```json
{
  "name": "extract_prescription",
  "input_schema": {
    "type": "object",
    "properties": {
      "medications": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "form": { "enum": ["pill","syrup","capsule","drops","injection"] },
            "dose": { "type": "string" },
            "intervalHours": { "type": "integer", "minimum": 1, "maximum": 72 },
            "startTime": { "type": "string", "pattern": "^([01]\\d|2[0-3]):[0-5]\\d$" },
            "durationDays": { "type": "integer", "minimum": 1, "maximum": 365 },
            "treatmentKind": { "enum": ["temporary","permanent"] },
            "confidence": { "type": "number" }
          },
          "required": ["name","form","dose","intervalHours","startTime","durationDays","treatmentKind"]
        }
      },
      "warnings": { "type": "array", "items": { "type": "string" } }
    },
    "required": ["medications"]
  }
}
```

Prompt (resumen): *"Eres un asistente clínico. Extrae de la imagen de la receta los
medicamentos con su forma, dosis, frecuencia (en horas), hora de inicio, duración en
días y si el tratamiento es temporal o permanente. Si un dato no aparece, infiere un
valor razonable y añádelo a `warnings`. Devuelve solo el JSON de la herramienta."*

> El esquema coincide con la validación Zod del formulario
> (`src/validations/medicationSchema.ts`), así que la salida encaja directamente.

---

## Consideraciones

- **Confirmación humana obligatoria**: el resultado **siempre** precarga el formulario
  para que la persona revise y confirme; nunca se guarda automático. (Ya es así.)
- **Privacidad**: una receta es dato de salud. Documenta retención/borrado de la imagen
  en el backend; idealmente no persistirla más de lo necesario.
- **No es consejo médico**: la app organiza recordatorios; la pauta la define el médico.
- **Fallback**: ante error o baja `confidence`, deja al usuario completar a mano.
