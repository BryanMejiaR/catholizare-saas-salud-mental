# USERS-002 — High-Level Technical Contract

## Alcance

Implementar la gestión mínima de usuarios del MVP sobre Supabase Auth y `profiles`, sin crear expedientes clínicos todavía. La inicialización automática del expediente queda diferida a EXPEDIENTE-003.

## Roles y permisos

- `administrador`: crea, lista, edita estado y asigna Profesionales/Pacientes de la plataforma. No crea Administradores ni Super Administradores.
- `profesional`: crea Pacientes asociados a sí mismo.
- `super_administrador`: crea Administradores y otros Super Administradores.
- `paciente`: no gestiona usuarios.

## Datos

La entidad operativa es `profiles`, con espejo de rol en `auth.users.app_metadata.role`.

Para Pacientes:

- `primary_professional_id`: Profesional principal.
- `assigned_professional_ids`: Profesionales activos asignados, máximo 3, incluye al principal.

Para roles no Paciente, ambos campos permanecen vacíos/null.

## Flujos incluidos

- Crear usuario por invitación mediante Supabase Auth Admin.
- Crear `profile` en estado `pendiente_activacion`.
- Sincronizar `app_metadata.role` y `app_metadata.account_status`.
- Listar usuarios según rol.
- Desactivar/reactivar usuarios sin eliminación física.
- Registrar auditoría en `audit_logs`.

## Fuera de este incremento

- Inicialización de expediente clínico al crear Paciente.
- Cambio de correo para usuarios activos.
- Importación masiva.
- Permisos granulares.
- Acceso administrativo a contenido clínico.
