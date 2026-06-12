# EVAL-014 Technical Contract

## Alcance MVP

EVAL-014 registra evaluaciones psicologicas vinculadas a expedientes clinicos, permite generar un borrador asistido por IA con contexto minimo y exige validacion profesional antes de incorporar resultados al expediente.

Este MVP no crea banco interno de pruebas, no almacena reactivos completos, manuales, claves de correccion protegidas ni archivos adjuntos. Los metodos `imagen` y `archivo` solo registran el origen del insumo; la subida segura a Storage queda fuera de esta iteracion.

## Modelo de datos

La migracion `202606030001_psychological_assessments_base.sql` crea `psychological_assessments` con:

- Vinculo obligatorio a `expedientes`, `patient_id` y `professional_id`.
- Estado de ciclo de vida: `borrador`, `analizada`, `validada`, `archivada`, `anulada_logicamente`.
- Estado de validacion profesional: `pendiente`, `validado`, `rechazado`, `corregido`.
- JSON controlado para puntajes directos, transformados, percentiles y puntos de corte.
- Referencia opcional a `ai_sessions` cuando existe borrador generado por GPT-007.

## Seguridad y permisos

- RLS permite que solo el Profesional propietario lea, cree o actualice sus evaluaciones.
- Administrador, Super Administrador y Paciente no tienen acceso operativo al contenido clinico de evaluaciones.
- `DELETE` queda revocado para `authenticated` y `anon`.
- El trigger `enforce_psychological_assessment_rules` valida que la evaluacion pertenezca al expediente, paciente y profesional correctos.
- Las evaluaciones validadas, archivadas o anuladas quedan bloqueadas contra actualizaciones.
- Las acciones de servidor vuelven a verificar expediente activo y ownership antes de crear, analizar o validar.

## IA clinica

`requestAssessmentAiDraftAction` envia a GPT-007 un paquete clinico controlado con identificadores internos, finalidad de evaluacion y puntajes capturados por el Profesional. No se envia contenido de reactivos protegidos desde el sistema.

El borrador generado:

- Se registra en `ai_sessions`.
- Se vincula a la evaluacion como `ai_draft_interpretation`.
- No se considera resultado formal hasta que el Profesional valida.

## Auditoria

Se auditan:

- `assessment_read`
- `assessment_create`
- `assessment_ai_request`
- `assessment_validate`

Los logs no copian puntajes, interpretaciones ni contenido clinico extenso. Solo registran accion, entidad, resultado y metadata operativa minima.

## Deuda tecnica

- Storage seguro para imagenes/adjuntos con politicas por profesional y retencion clinica.
- Anulacion logica de evaluaciones con razon obligatoria.
- Vinculacion explicita a cortes de reevaluacion TCC cuando PROCESO-TCC exponga esos cortes como entidad persistente.
- Exportacion o resumen clinico formal de evaluacion validada.
