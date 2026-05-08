# PROCESO-GENERAL-005 — Proceso Terapéutico — Modelo General

## Propósito

Gestionar el proceso terapéutico de un paciente usando el modelo terapéutico General: un flujo configurable y editable por el Profesional que sirve como base para cualquier enfoque clínico no especificado como un modelo propio.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Crea, configura y gestiona procesos terapéuticos de sus pacientes |
| Paciente | Sin acceso directo al proceso; ve solo el resumen publicado en su portal |

---

## Conceptos clave

- **Plantilla de proceso**: estructura reutilizable que define los pasos y campos de un proceso terapéutico. El Profesional puede editar la plantilla del modelo General.
- **Proceso terapéutico**: instancia de una plantilla aplicada a un paciente específico. Tiene un inicio, un estado activo con sesiones, y un cierre (egreso).
- **Paso del proceso**: unidad de trabajo dentro del proceso (ej. "Evaluación inicial", "Establecimiento de objetivos", "Intervención", "Cierre").
- **Campo del paso**: campo de texto, selección u otro tipo de input que el Profesional completa dentro de un paso.

---

## Funcionalidades

### F-01 Editar plantilla del modelo General
- El Profesional puede agregar, eliminar y reordenar pasos en la plantilla del modelo General.
- Por cada paso puede agregar, editar o eliminar campos con nombre y tipo (texto libre, texto largo, selección, fecha, número).
- Los cambios a la plantilla aplican únicamente a procesos nuevos que se inicien después del cambio.
- Los procesos en curso conservan la versión de la plantilla con la que fueron iniciados (versionado de plantillas).
- La plantilla del modelo General no tiene una estructura predefinida impuesta; el Profesional la construye desde una plantilla base vacía o desde la plantilla por defecto de Catholizare.

### F-02 Iniciar proceso terapéutico
- El Profesional inicia un proceso terapéutico para un Paciente seleccionando el modelo (General en este módulo).
- Al iniciar, se crea una instancia del proceso con la versión actual de la plantilla.
- Solo puede haber un proceso activo por paciente en cualquier momento; si hay uno activo, debe cerrarse antes de iniciar uno nuevo.

### F-03 Completar pasos del proceso
- El Profesional avanza por los pasos del proceso, completando los campos de cada uno.
- Los pasos completados se marcan como tales; pueden revisarse y editarse mientras el proceso esté activo.
- No hay orden forzado entre pasos; el Profesional puede llenar los pasos en cualquier secuencia.

### F-04 Dar instrucciones al asistente GPT
- Dentro de un paso activo, el Profesional puede escribir instrucciones adicionales en un campo de texto libre para orientar a GPT en la conceptualización del caso (ver D-02.5).
- GPT usa esas instrucciones junto con el contenido del proceso para generar sugerencias de pre-llenado.
- Las instrucciones del Profesional quedan guardadas en el proceso como parte del historial.

### F-05 Vincular sesiones al proceso
- Cada sesión (cita con el paciente) puede vincularse a un paso del proceso activo.
- El Profesional puede registrar avance del proceso directamente desde el contexto de una sesión.

### F-06 Cerrar proceso terapéutico
- El Profesional cierra el proceso marcándolo como concluido.
- El cierre del proceso está vinculado a la creación de la Nota de Egreso (ver NOTAS-004).
- Un proceso cerrado es de solo lectura.

---

## Reglas de negocio

1. Solo puede haber **un proceso activo** por paciente a la vez.
2. Los procesos cerrados son inmutables; no pueden reabrirse (se crea un proceso nuevo si el paciente retorna).
3. La plantilla que se usa al iniciar un proceso es una **instantánea** de la versión vigente en ese momento; cambios posteriores a la plantilla no afectan el proceso.
4. GPT no tiene acceso a los datos de identificación del paciente (nombre, domicilio, etc.). Solo accede al contenido del proceso terapéutico y a las instrucciones del Profesional.
5. Las sugerencias de GPT son borradores; no se guardan hasta que el Profesional las acepta y guarda explícitamente.

---

## Datos que maneja

### Plantilla del proceso
| Campo | Descripción |
|---|---|
| `template_id` | Identificador único de la plantilla |
| `professional_id` | Profesional propietario de la plantilla |
| `model_type` | `general` |
| `version` | Número de versión de la plantilla |
| `steps` | Lista ordenada de pasos con sus campos |
| `created_at` | Fecha de creación de esta versión |

### Proceso terapéutico
| Campo | Descripción |
|---|---|
| `process_id` | Identificador único del proceso |
| `expediente_id` | Expediente al que pertenece |
| `template_snapshot` | Copia de la plantilla en el momento de inicio |
| `status` | `activo`, `cerrado` |
| `started_at` | Fecha de inicio |
| `closed_at` | Fecha de cierre (null si activo) |
| `step_data` | Contenido completado por el profesional en cada paso |
| `gpt_instructions` | Instrucciones del profesional para GPT (por paso) |

---

## Dependencias

- EXPEDIENTE-003 — el proceso vive dentro del expediente clínico.
- NOTAS-004 — el cierre del proceso requiere nota de egreso.
- GPT-007 — el asistente GPT pre-llena campos de los pasos del proceso.
- AGENDA-008 — las sesiones se vinculan a pasos del proceso.

---

## Fuera de alcance del MVP

- Plantillas compartidas entre profesionales de la misma organización
- Estadísticas de progreso terapéutico automatizadas
- Exportación del proceso completo a PDF
- Comparativa entre versiones del proceso
