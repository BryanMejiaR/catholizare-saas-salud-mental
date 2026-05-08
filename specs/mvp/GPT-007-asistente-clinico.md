# GPT-007 — Asistente Clínico GPT

## Propósito

Proveer al Profesional un asistente de inteligencia artificial que pre-llena campos del proceso terapéutico activo del paciente. El asistente es una herramienta de apoyo; el Profesional valida y decide sobre todo el contenido generado.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Activa el asistente, proporciona instrucciones y valida las sugerencias |
| Paciente | Sin interacción directa con el asistente |

---

## Funcionalidades

### F-01 Activar asistente en un paso del proceso
- Dentro de un paso activo del proceso terapéutico (General o TCC), el Profesional puede activar el asistente GPT.
- El asistente tiene acceso al contenido ya registrado en el proceso activo (pasos completados, instrucciones previas).
- El asistente **no tiene acceso** a los datos de identificación del paciente (nombre, domicilio, teléfono, número de seguridad social).

### F-02 Escribir instrucciones para GPT
- El Profesional puede escribir instrucciones adicionales en un campo de texto libre para orientar al asistente (ver D-02.5).
- Ejemplos de instrucciones: "el paciente presenta alta resistencia al cambio", "enfocar la conceptualización en el eje de creencias nucleares de abandono".
- Las instrucciones se guardan en el proceso terapéutico y son visibles en sesiones futuras.

### F-03 Recibir y revisar sugerencias de pre-llenado
- El asistente genera sugerencias de contenido para los campos del paso activo.
- Las sugerencias se presentan como texto editable en la interfaz, visualmente diferenciadas del contenido validado (por ejemplo, con fondo de color diferente o etiqueta "Sugerencia GPT").
- El Profesional puede:
  - Aceptar la sugerencia tal como está (se guarda como contenido del campo)
  - Editar la sugerencia antes de guardarla
  - Rechazarla completamente (se descarta sin guardar)

### F-04 Guardar contenido validado
- Solo el Profesional puede guardar contenido en los campos del proceso terapéutico.
- No existe flujo de guardado automático desde GPT.
- Una vez guardado por el Profesional, el contenido tiene carácter clínico y queda registrado con el timestamp y el ID del Profesional.

---

## Restricciones de privacidad

El asistente GPT opera con las siguientes restricciones estrictas de acceso a datos:

**GPT puede acceder a:**
- Contenido de los pasos del proceso terapéutico activo
- Instrucciones del Profesional para el caso
- Tipo de modelo terapéutico (General o TCC)
- Pasos previos completados del mismo proceso

**GPT no puede acceder a:**
- Nombre del paciente
- Fecha de nacimiento
- Domicilio
- Teléfono
- Número de seguridad social
- Cualquier otro dato de identificación personal del paciente
- Notas clínicas (admisión, evolución, egreso)
- Información de otros pacientes

La separación entre datos del proceso terapéutico y datos de identificación debe aplicarse en la capa de preparación del contexto enviado a GPT, antes de cualquier llamada a la API.

---

## Reglas de negocio

1. El asistente solo está disponible cuando hay un proceso terapéutico activo.
2. Las sugerencias de GPT no tienen valor clínico hasta que el Profesional las guarda explícitamente.
3. El sistema registra en el log de auditoría: cuándo se activó el asistente, qué campos recibieron sugerencias y cuándo el Profesional guardó contenido derivado de una sugerencia GPT.
4. El asistente no puede crear, modificar ni eliminar notas clínicas.
5. El proveedor de GPT es OpenAI; el modelo específico a usar se define al momento de la implementación (pendiente de D-09).

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `gpt_session_id` | Identificador de la sesión de consulta al asistente |
| `process_id` | Proceso terapéutico en el que se activó |
| `step_id` | Paso del proceso en el que se activó |
| `professional_instructions` | Instrucciones escritas por el Profesional para este caso |
| `suggested_content` | Sugerencias generadas (temporales; no se persisten si no son aceptadas) |
| `accepted_at` | Timestamp de cuando el Profesional guardó contenido derivado de GPT |

---

## Dependencias

- PROCESO-GENERAL-005 — el asistente opera dentro de procesos del modelo General.
- PROCESO-TCC-006 — el asistente opera dentro de procesos del modelo TCC.
- Log de auditoría — registra uso del asistente y guardado de sugerencias.
- API de OpenAI — proveedor del modelo de lenguaje.

---

## Fuera de alcance del MVP

- Generación autónoma de notas clínicas por GPT
- Chatbot de atención al paciente
- Análisis de sentimientos o riesgo automatizado
- Integración con modelos de lenguaje distintos a OpenAI (en el MVP)
- Historial de conversaciones con GPT por caso
