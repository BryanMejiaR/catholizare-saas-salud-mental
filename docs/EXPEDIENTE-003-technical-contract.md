# EXPEDIENTE-003 Technical Contract

## Alcance de esta iteracion

Esta entrega crea la base operativa del expediente clinico para el Profesional:

- crear un expediente para un Paciente asignado;
- listar expedientes del Profesional;
- consultar detalle basico del expediente;
- actualizar datos de identificacion y motivo inicial;
- actualizar historia clinica psicologica inicial;
- registrar estado de consentimiento informado;
- archivar logicamente un expediente.

Quedan fuera de esta iteracion: notas clinicas completas, procesos terapeuticos, evaluaciones psicologicas, documentos, IA clinica, exportacion PDF y portal del Paciente salvo la estructura futura de resumen terapeutico.

## Naming

Se usa naming en espanol para tablas clinicas porque el spec y `docs/data-model-overview.md` ya fijan estos nombres:

- `expedientes`
- `historias_clinicas`
- `consentimientos`
- `resumenes_terapeuticos`

No se introduce `organization_id`, `tenant_id` ni tabla `organizations`, conforme a D-12.

## Separacion de acceso

- Profesional: unico actor operativo para contenido clinico. Solo puede acceder a expedientes donde `professional_id = auth.uid()`.
- Paciente: no accede al expediente completo en MVP. Solo puede leer resumenes terapeuticos con `status = 'publicado'`.
- Administrador: no tiene acceso al contenido clinico.
- Super Administrador: no tiene acceso al contenido clinico en operacion normal.
- Service role: usado solo desde servidor para flujos controlados y auditoria.

## Reglas de base de datos

- RLS esta habilitado desde la migracion inicial.
- Un expediente activo es unico por par `patient_id + professional_id`.
- Un Paciente puede tener maximo 3 expedientes activos simultaneos.
- El Profesional debe estar asignado al Paciente en `profiles.assigned_professional_ids`.
- No existe DELETE ordinario; el cierre operativo se hace con `status = 'archivado'`.

## Auditoria

Las acciones de esta iteracion escriben en `audit_logs`:

- `expediente_create`
- `expediente_read`
- `expediente_update`
- `expediente_archive`
- `historia_clinica_update`
- `consentimiento_update`

Los fallos de auditoria posteriores a una operacion exitosa se reportan a Sentry sin convertir una operacion completada en error para el usuario.

## Datos sensibles

`identification_data` y `historias_clinicas` son datos clinicos/sensibles. No deben usarse en reportes administrativos, rankings, analitica individualizada ni paquetes de IA sin flujo explicito futuro conforme GPT-007.

## Deuda tecnica aceptada

Los campos `session_notes_count`, `assessments_count` y `documents_count` se inicializan en cero y se muestran como contadores informativos. Los triggers de mantenimiento pertenecen a NOTAS-004, EVAL-014 y el modulo de documentos; no forman parte de esta primera base de EXPEDIENTE-003.
