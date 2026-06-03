# GPT-007 Technical Contract

## Alcance de esta iteracion

Esta entrega implementa la primera base operativa del asistente clinico GPT:

- tabla `ai_sessions` para registrar sesiones de IA por Profesional;
- llamada server-only a OpenAI Responses API;
- variable server-only `OPENAI_API_KEY`;
- variable server-only `OPENAI_MODEL`, con default configurable;
- generacion de borrador para prellenado de pasos de proceso terapeutico;
- paquete clinico controlado sin nombre ni email del Paciente;
- UI de borrador dentro de cada paso de proceso;
- cero guardado automatico de contenido generado por IA;
- auditoria de solicitudes exitosas, denegadas y fallidas.

Quedan fuera de esta iteracion: conceptualizacion completa, plan de tratamiento, planeacion de sesion, resumen terapeutico para Paciente, analisis de imagenes de evaluacion, aprobacion/publicacion de borradores y uso de IA desde modulos distintos al proceso terapeutico.

## Reglas de seguridad

- Solo un Profesional activo puede solicitar borradores.
- El Profesional debe ser propietario del proceso.
- El proceso debe estar activo.
- La IA no modifica expedientes, notas, procesos, portal ni agenda.
- El paquete enviado a OpenAI excluye datos identificables directos del Paciente.
- `OPENAI_API_KEY` nunca se expone al cliente.
- Administrador y Super Administrador no tienen acceso operativo al contenido de `ai_sessions`.
- Los logs de auditoria no copian el paquete clinico ni la sugerencia generada.

## Paquete clinico controlado

Para `prellenado_paso`, el paquete incluye:

- tipo de tarea;
- `process.id`, `model_type` y `status`;
- paso actual;
- campos del paso con valores actuales;
- pasos previos marcados como completados o no;
- directrices clinicas escritas por el Profesional.

No incluye:

- nombre del Paciente;
- email del Paciente;
- datos de identificacion del expediente;
- notas clinicas completas;
- contenido de otros Pacientes o Profesionales.

## Auditoria

Accion registrada:

- `ai_request`

Metadata permitida:

- `function_type`;
- `process_id`;
- `step_id`.

Los fallos de auditoria no interrumpen operaciones ya completadas.

## Fuentes OpenAI

La implementacion usa Responses API porque la documentacion actual de OpenAI indica que los modelos recientes estan disponibles mediante Responses API y SDKs. El modelo queda configurable con `OPENAI_MODEL` para poder ajustar costo/calidad sin cambios de codigo.
