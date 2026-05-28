# NOTAS-004 Technical Contract

## Alcance de esta iteracion

Esta entrega implementa la base operativa de notas clinicas desde el expediente:

- crear nota clinica desde expediente;
- listar notas de un expediente;
- consultar detalle de una nota;
- editar solo notas en borrador;
- confirmar nota clinica;
- crear addendum sobre nota confirmada;
- anular logicamente una nota;
- exportar una nota confirmada a vista imprimible para PDF;
- auditar lectura, creacion, edicion, confirmacion, addendum, anulacion y exportacion.

Quedan fuera de esta iteracion: creacion desde agenda, storage permanente de PDF, firma digital avanzada, procesos terapeuticos, TCC e IA clinica.

La exportacion MVP genera una vista print-ready que el navegador puede guardar como PDF. No crea archivos en storage ni `pdf_file_id`.

## Reglas normativas

- Una nota confirmada no se modifica por sobrescritura.
- Las correcciones posteriores se registran como nota tipo `addendum`.
- No existe DELETE ordinario.
- El Paciente no accede a notas clinicas completas en MVP.
- Administrador y Super Administrador no acceden al contenido clinico.
- Solo expedientes activos permiten crear, editar, confirmar, anular o agregar addendum.

## Reglas de consentimiento

La creacion de notas ordinarias requiere `expedientes.consent_status` en:

- `firmado_fisico`
- `firmado_digital`
- `excepcion_justificada`

La excepcion `excepcion_justificada` permite documentar atencion inicial, urgencia u otro supuesto interno permitido.

## Auditoria

Acciones registradas:

- `nota_clinica_create`
- `nota_clinica_read`
- `nota_clinica_update_draft`
- `nota_clinica_confirm`
- `nota_clinica_addendum`
- `nota_clinica_annul`
- `nota_clinica_export`

Los fallos de auditoria no interrumpen operaciones ya completadas.
