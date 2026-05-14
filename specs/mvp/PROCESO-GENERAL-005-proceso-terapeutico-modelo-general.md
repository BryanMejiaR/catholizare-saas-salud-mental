# PROCESO-GENERAL-005 — Proceso Terapéutico — Modelo General

## Propósito

Gestionar el proceso terapéutico de un Paciente usando el modelo terapéutico General: un flujo configurable y editable por el Profesional que sirve como base para cualquier enfoque clínico no especificado como un modelo propio.

El proceso terapéutico vive dentro del expediente clínico y se vincula con notas clínicas, citas, evaluaciones psicológicas, conceptualización, plan de tratamiento y seguimiento.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Crea, configura y gestiona procesos terapéuticos de sus Pacientes. |
| Paciente | Sin acceso directo al proceso; ve solo el resumen terapéutico compartido publicado en su portal. |
| GPT-007 | Puede apoyar al Profesional con prellenado, conceptualización, plan de tratamiento y planeación de sesiones, bajo paquete clínico controlado. |

---

## Conceptos clave

- **Plantilla de proceso**: estructura reutilizable que define los pasos y campos de un proceso terapéutico. El Profesional puede editar la plantilla del modelo General.
- **Proceso terapéutico**: instancia de una plantilla aplicada a un Paciente específico. Tiene un inicio, un estado activo con sesiones y un cierre.
- **Paso del proceso**: unidad de trabajo dentro del proceso, por ejemplo evaluación inicial, establecimiento de objetivos, intervención o cierre.
- **Campo del paso**: campo de texto, selección u otro tipo de input que el Profesional completa dentro de un paso.

---

## Funcionalidades

### F-01 Editar plantilla del modelo General

- El Profesional puede agregar, eliminar y reordenar pasos en la plantilla del modelo General.
- Por cada paso puede agregar, editar o eliminar campos con nombre y tipo: texto libre, texto largo, selección, fecha o número.
- Los cambios a la plantilla aplican únicamente a procesos nuevos que se inicien después del cambio.
- Los procesos en curso conservan la versión de la plantilla con la que fueron iniciados.
- La plantilla del modelo General no tiene una estructura predefinida impuesta; el Profesional la construye desde una plantilla base vacía o desde la plantilla por defecto de Catholizare.

---

### F-02 Iniciar proceso terapéutico

- El Profesional inicia un proceso terapéutico para un Paciente seleccionando el modelo General.
- Al iniciar, se crea una instancia del proceso con la versión actual de la plantilla.
- Solo puede haber un proceso activo por Paciente en cualquier momento; si hay uno activo, debe cerrarse antes de iniciar uno nuevo.

---

### F-03 Completar pasos del proceso

- El Profesional avanza por los pasos del proceso, completando los campos de cada uno.
- Los pasos completados se marcan como tales; pueden revisarse y editarse mientras el proceso esté activo.
- No hay orden forzado entre pasos; el Profesional puede llenar los pasos en cualquier secuencia.

---

### F-04 Dar instrucciones al asistente GPT

Dentro de un paso activo, el Profesional puede escribir instrucciones adicionales en un campo de texto libre para orientar a GPT-007.

GPT-007 puede usar estas instrucciones junto con el paquete clínico controlado correspondiente para generar sugerencias de prellenado, conceptualización, plan de tratamiento o planeación de sesión.

Las instrucciones del Profesional quedan guardadas en el proceso como parte del historial.

Restricciones:

- GPT-007 no tiene acceso libre, permanente ni indiscriminado al expediente completo.
- GPT-007 solo trabaja con el paquete clínico autorizado para la tarea solicitada.
- Las sugerencias de GPT-007 son borradores y no se guardan hasta que el Profesional las acepta o edita y guarda explícitamente.

---

### F-05 Vincular sesiones al proceso

- Cada sesión o cita con el Paciente puede vincularse a un paso del proceso activo.
- El Profesional puede registrar avance del proceso directamente desde el contexto de una sesión.
- Las notas clínicas de sesión se gestionan desde NOTAS-004 y pueden vincularse al proceso.

---

### F-06 Cerrar proceso terapéutico

- El Profesional cierra el proceso marcándolo como concluido.
- El cierre del proceso está vinculado a la creación de la Nota de Egreso en NOTAS-004.
- Un proceso cerrado es de solo lectura.

---

### F-07 Vincular evaluaciones psicológicas

El Profesional puede vincular resultados de evaluaciones psicológicas al proceso terapéutico general.

Las evaluaciones se gestionan desde EVAL-014.

El proceso puede consultar o utilizar:

- nombre de la evaluación;
- fecha de aplicación;
- resultados validados;
- interpretación clínica;
- implicaciones terapéuticas;
- relación con objetivos del proceso.

Restricciones:

- El proceso no almacena pruebas completas.
- El proceso no almacena reactivos protegidos.
- El proceso no almacena manuales ni claves de corrección protegidas.
- El proceso solo consulta resultados validados o autorizados.
- GPT-007 puede usar estos resultados dentro de un paquete clínico controlado.

---

## Reglas de negocio

1. Solo puede haber un proceso activo por Paciente a la vez.
2. Los procesos cerrados son de solo lectura; si el Paciente retorna, se crea un proceso nuevo.
3. La plantilla que se usa al iniciar un proceso es una instantánea de la versión vigente en ese momento; cambios posteriores a la plantilla no afectan el proceso.
4. GPT-007 no tiene acceso libre, permanente ni indiscriminado al expediente completo.
5. GPT-007 puede trabajar con paquete clínico controlado cuando el Profesional solicita una función asistida por IA.
6. Las sugerencias de GPT-007 son borradores; no se guardan hasta que el Profesional las acepta y guarda explícitamente.
7. Las evaluaciones psicológicas se gestionan desde EVAL-014 y el proceso solo consulta resultados validados.
8. El proceso no almacena instrumentos psicológicos protegidos completos.

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
| `patient_id` | Paciente relacionado |
| `professional_id` | Profesional responsable |
| `template_snapshot` | Copia de la plantilla en el momento de inicio |
| `status` | `activo`, `cerrado` |
| `started_at` | Fecha de inicio |
| `closed_at` | Fecha de cierre, null si activo |
| `step_data` | Contenido completado por el Profesional en cada paso |
| `gpt_instructions` | Instrucciones del Profesional para GPT-007 por paso |
| `linked_note_ids` | Notas clínicas vinculadas, si aplica |
| `linked_assessment_ids` | Evaluaciones psicológicas vinculadas desde EVAL-014, si aplica |

---

## Dependencias

- EXPEDIENTE-003 — el proceso vive dentro del expediente clínico.
- NOTAS-004 — el cierre del proceso requiere nota de egreso; las notas pueden vincularse a pasos.
- GPT-007 — asistente clínico para prellenado, conceptualización, tratamiento y planeación.
- AGENDA-008 — las sesiones se vinculan a pasos del proceso.
- EVAL-014 — evaluaciones psicológicas y resultados vinculados al proceso.

---

## Fuera de alcance del MVP

- Plantillas compartidas entre profesionales.
- Estadísticas de progreso terapéutico automatizadas.
- Exportación del proceso completo a PDF.
- Comparativa entre versiones del proceso.
- Aplicación directa de pruebas psicológicas protegidas dentro del proceso.
- Banco interno de instrumentos psicológicos.
