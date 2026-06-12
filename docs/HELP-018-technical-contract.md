# HELP-018 Technical Contract

## Alcance MVP

HELP-018 provee ayuda operativa para Profesionales, tickets de soporte tecnico y gestion basica de articulos por Administrador o Super Administrador.

No es un modulo clinico. No accede a expedientes, notas clinicas, evaluaciones psicologicas, imagenes de pruebas ni datos sensibles de Pacientes.

## Modelo de datos

La migracion `202606040001_help_center_base.sql` crea:

- `help_articles`: articulos y guias operativas.
- `support_tickets`: solicitudes de soporte creadas por Profesionales.
- `help_interactions`: registro minimo de interacciones de ayuda para uso futuro.

No se crean adjuntos ni buckets de Storage en esta iteracion.

## Permisos

- Profesional:
  - Lee articulos activos.
  - Crea tickets propios.
  - Lee sus tickets recientes.
- Administrador y Super Administrador:
  - Leen todos los articulos y tickets.
  - Crean y actualizan articulos.
  - Actualizan estado de tickets.
- Paciente:
  - Sin acceso a HELP-018 en MVP.

Todas las tablas tienen RLS activo. `DELETE` esta revocado en articulos y tickets. Las interacciones son append-only para usuarios autenticados.

## Privacidad

El formulario de soporte exige confirmacion explicita de que el ticket no contiene datos clinicos sensibles, nombres de pacientes, imagenes de pruebas, notas clinicas ni expedientes completos.

Los audit logs de HELP-018 registran accion, entidad, resultado y metadata operativa minima. No copian el contenido del ticket.

## Auditoria

Eventos implementados:

- `help_content_read`
- `help_admin_read`
- `support_ticket_create`
- `support_ticket_update`
- `help_article_create`
- `help_article_update`

Al cargar el dashboard profesional se registra una fila minima en `help_interactions` con
`content_type = 'guia'`, sin contenido clinico ni datos de Pacientes.

## Fuera de alcance

- Asistente IA de ayuda.
- Chat en tiempo real.
- Adjuntos en tickets.
- SLA avanzado.
- Soporte clinico, supervision o mentorias dentro del Centro de Ayuda.
