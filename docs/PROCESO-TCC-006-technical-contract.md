# PROCESO-TCC-006 Technical Contract

## Alcance de esta iteracion

Esta entrega implementa la base operativa del proceso terapeutico de modelo TCC:

- seleccion de modelo `tcc` al iniciar proceso desde expediente activo o desde el modulo de procesos;
- estructura TCC fija definida por Catholizare, no editable por el Profesional;
- snapshot de la estructura TCC al iniciar proceso;
- distincion persistente entre procesos `general` y `tcc` mediante `procesos_terapeuticos.model_type`;
- edicion de contenido clinico por fase mientras el proceso esta activo;
- instrucciones por fase para GPT-007 guardadas como texto del Profesional;
- vinculacion manual de notas clinicas confirmadas al proceso;
- cierre del proceso vinculado a una nota de egreso confirmada;
- auditoria reutilizando los eventos del modulo de procesos.

Quedan fuera de esta iteracion: llamadas reales a GPT-007, evaluaciones EVAL-014, agenda, estado de animo graficado, versiones separadas de conceptualizacion/plan, portal del Paciente y exportacion PDF completa del proceso TCC.

## Reglas de seguridad

- El proceso TCC vive dentro de un expediente clinico.
- Solo el Profesional propietario del expediente puede leer o modificar el proceso.
- Administrador, Super Administrador y Paciente no acceden al contenido TCC en operacion normal.
- Un proceso cerrado es de solo lectura.
- La estructura base TCC no se guarda en `plantillas_proceso` editable por Profesional.
- El snapshot TCC queda en `template_snapshot` para proteger procesos ya iniciados ante cambios futuros de Catholizare.
- Solo puede existir un proceso activo por `patient_id` + `professional_id`, sin importar si es General o TCC.
- No existe eliminacion fisica ordinaria.

## Separacion de casos

Catholizare mantiene casos independientes por par Profesional-Paciente (D-11). Por eso la restriccion de proceso activo se conserva como un proceso activo por `patient_id` + `professional_id`.

## Auditoria

Acciones registradas:

- `proceso_read`
- `proceso_start`
- `proceso_step_update`
- `proceso_note_link`
- `proceso_close`

Los eventos incluyen `model_type` en metadata cuando aplica. Los fallos de auditoria no interrumpen operaciones ya completadas.

## Dependencias diferidas

- GPT-007 usara `gpt_instructions` y el paquete clinico controlado en una entrega posterior.
- EVAL-014 aportara resultados validados de evaluaciones psicologicas.
- AGENDA-008 y ZOOM-010 aportaran citas y sesiones vinculadas.
- PORTAL-011 solo mostrara resumen terapeutico publicado, no el proceso TCC completo.
