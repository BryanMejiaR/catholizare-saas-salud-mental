# PROCESO-GENERAL-005 Technical Contract

## Alcance de esta iteracion

Esta entrega implementa la base operativa del proceso terapeutico de modelo General:

- plantilla General versionada por Profesional;
- edicion visual de plantilla mediante nueva version;
- inicio de proceso desde expediente activo o desde el modulo de procesos;
- solo un proceso activo por Paciente y Profesional;
- snapshot de plantilla al iniciar proceso;
- edicion de datos de pasos mientras el proceso esta activo;
- instrucciones por paso para GPT-007 guardadas como texto del Profesional;
- vinculacion manual de notas clinicas confirmadas al proceso;
- cierre de proceso vinculado a una nota de egreso confirmada;
- auditoria de lectura, plantilla, inicio, actualizacion, vinculacion y cierre.

Quedan fuera de esta iteracion: llamadas reales a GPT-007, agenda, evaluaciones EVAL-014, proceso TCC y exportacion PDF del proceso.

## Reglas de seguridad

- El proceso vive dentro de un expediente clinico.
- Solo el Profesional propietario del expediente puede leer o modificar el proceso.
- Administrador, Super Administrador y Paciente no acceden al contenido del proceso en operacion normal.
- Un proceso cerrado es de solo lectura.
- Cambios a plantilla no modifican procesos existentes porque cada proceso guarda `template_snapshot`.
- Si un Profesional no tiene plantilla propia, el sistema crea la version 1 antes de iniciar el primer proceso.
- Los IDs de pasos y campos son unicos para preservar `step_data`.
- No existe eliminacion fisica ordinaria.

## Separacion de casos

Aunque el spec habla de un proceso activo por Paciente, Catholizare mantiene casos independientes por par Profesional-Paciente (D-11). Por eso la restriccion se implementa como un proceso activo por `patient_id` + `professional_id`.

## Auditoria

Acciones registradas:

- `proceso_template_update`
- `proceso_read`
- `proceso_start`
- `proceso_step_update`
- `proceso_note_link`
- `proceso_close`

Los fallos de auditoria no interrumpen operaciones ya completadas.
