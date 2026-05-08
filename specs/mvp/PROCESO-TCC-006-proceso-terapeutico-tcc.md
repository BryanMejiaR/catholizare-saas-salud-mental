# PROCESO-TCC-006 — Proceso Terapéutico — Modelo TCC

## Propósito

Gestionar el proceso terapéutico de un paciente usando el modelo de Terapia Cognitivo-Conductual (TCC). A diferencia del modelo General, la estructura del modelo TCC está predefinida y no es libremente editable por el Profesional.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Inicia y gestiona procesos TCC de sus pacientes; no puede modificar la estructura del modelo |
| Paciente | Sin acceso directo al proceso; ve solo el resumen publicado en su portal |

---

## Estructura del modelo TCC

El modelo TCC sigue la metodología estándar de la Terapia Cognitivo-Conductual. Sus pasos predefinidos son:

| Paso | Nombre | Descripción |
|---|---|---|
| 1 | Evaluación y conceptualización | Historia del problema, análisis funcional, formulación del caso |
| 2 | Psicoeducación | Explicación del modelo cognitivo-conductual al paciente |
| 3 | Establecimiento de objetivos | Definición de metas terapéuticas en términos conductuales y cognitivos |
| 4 | Intervención conductual | Activación conductual, exposición, experimentos conductuales |
| 5 | Reestructuración cognitiva | Identificación y modificación de pensamientos automáticos y esquemas |
| 6 | Entrenamiento en habilidades | Habilidades de afrontamiento, regulación emocional, resolución de problemas |
| 7 | Prevención de recaídas | Plan de mantenimiento, identificación de señales de alerta |
| 8 | Cierre y evaluación | Evaluación de logros, nota de egreso |

Cada paso tiene campos predefinidos con estructura fija.

---

## Funcionalidades

### F-01 Iniciar proceso TCC
- El Profesional selecciona el modelo TCC al iniciar un proceso para un Paciente.
- La estructura de pasos es fija y proviene de la plantilla TCC de Catholizare.
- El Profesional no puede agregar, eliminar ni reordenar los pasos del modelo TCC.
- Solo puede haber un proceso activo por paciente a la vez.

### F-02 Completar pasos del proceso TCC
- El Profesional completa los campos de cada paso según la estructura predefinida.
- El Profesional puede avanzar los pasos en el orden que considere clínicamente apropiado.
- Los pasos completados pueden revisarse y editarse mientras el proceso esté activo.

### F-03 Dar instrucciones al asistente GPT
- Igual que en el modelo General (ver PROCESO-GENERAL-005 F-04): el Profesional puede escribir instrucciones adicionales para orientar a GPT en la conceptualización del caso.
- GPT usa esas instrucciones junto con el contenido del proceso para generar sugerencias de pre-llenado.
- Las instrucciones no modifican la estructura del modelo TCC.

### F-04 Consultar el modelo TCC de referencia
- El Profesional puede consultar la descripción de cada paso del modelo TCC directamente en la interfaz, a modo de guía metodológica.
- Esta vista de referencia es de solo lectura.

### F-05 Cerrar proceso TCC
- El Profesional cierra el proceso marcándolo como concluido desde el paso 8 (Cierre y evaluación).
- El cierre está vinculado a la creación de la Nota de Egreso (ver NOTAS-004).
- Un proceso cerrado es de solo lectura.

---

## Reglas de negocio

1. La estructura del modelo TCC (pasos y campos) **no es editable** por el Profesional. Solo el equipo de Catholizare puede modificarla.
2. Cambios futuros en la plantilla TCC por parte de Catholizare no afectan procesos en curso (versionado de plantillas, igual que en el modelo General).
3. Solo puede haber **un proceso activo** por paciente a la vez, independientemente del modelo.
4. GPT no tiene acceso a datos de identificación del paciente. Solo accede al contenido del proceso y a las instrucciones del Profesional.
5. Las sugerencias de GPT son borradores; no se guardan hasta que el Profesional las acepta explícitamente.

---

## Campos predefinidos por paso (referencia)

### Paso 1 — Evaluación y conceptualización
- Descripción del problema principal
- Historia del desarrollo del problema
- Antecedentes (disparadores)
- Consecuencias (conductuales, cognitivas, emocionales)
- Formulación del caso (conceptualización cognitivo-conductual)

### Paso 3 — Establecimiento de objetivos
- Objetivos conductuales (medibles y observables)
- Objetivos cognitivos
- Indicadores de progreso

### Paso 5 — Reestructuración cognitiva
- Pensamientos automáticos identificados
- Distorsiones cognitivas presentes
- Pensamientos alternativos trabajados
- Esquemas nucleares identificados

### Paso 7 — Prevención de recaídas
- Señales de alerta identificadas
- Estrategias de afrontamiento acordadas
- Plan de acción ante recaída

*(Los demás pasos tienen campos de texto libre estructurado por la metodología TCC.)*

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `process_id` | Identificador único del proceso |
| `expediente_id` | Expediente al que pertenece |
| `model_type` | `tcc` |
| `template_version` | Versión de la plantilla TCC usada al iniciar |
| `status` | `activo`, `cerrado` |
| `started_at` | Fecha de inicio |
| `closed_at` | Fecha de cierre (null si activo) |
| `step_data` | Contenido completado por el profesional en cada paso |
| `gpt_instructions` | Instrucciones del profesional para GPT (por paso) |

---

## Dependencias

- EXPEDIENTE-003 — el proceso vive dentro del expediente clínico.
- NOTAS-004 — el cierre del proceso requiere nota de egreso.
- GPT-007 — el asistente GPT puede pre-llenar campos de los pasos.
- AGENDA-008 — las sesiones se vinculan a pasos del proceso.

---

## Fuera de alcance del MVP

- Modificación de la estructura del modelo TCC por el Profesional
- Otros modelos terapéuticos específicos (se añaden en fases futuras)
- Herramientas de evaluación psicométrica integradas (BDI, BAI, etc.)
- Protocolos TCC especializados por trastorno (TCC para TOC, fobia, etc.)
