# USERS-002 — Gestión de Usuarios y Roles

## Propósito

Permitir la creación, edición, activación y desactivación de cuentas de usuario dentro de Catholizare. Garantizar el aislamiento de datos por organización y por profesional.

---

## Actores

| Actor | Interacción |
|---|---|
| Administrador | Crea y gestiona Profesionales y Pacientes de su organización |
| Super Administrador | Crea Administradores y otros Super Administradores; gestiona todas las organizaciones |
| Profesional | Crea Pacientes asociados a su práctica |

---

## Funcionalidades

### F-01 Crear usuario

**Administrador puede crear:**
- Cuentas de Profesional dentro de su organización
- Cuentas de Paciente dentro de su organización (asignadas a un Profesional)

**Profesional puede crear:**
- Cuentas de Paciente asociadas a sí mismo

**Super Administrador puede crear:**
- Cuentas de Administrador en cualquier organización
- Cuentas de Super Administrador

Al crear un usuario se envía correo de activación (ver AUTH-001 F-04).

### F-02 Editar usuario
- Administrador puede editar datos básicos (nombre, correo) de Profesionales y Pacientes de su organización.
- Profesional puede editar datos básicos de sus propios Pacientes.
- El correo no se puede cambiar si el usuario ya activó su cuenta; requiere flujo de cambio de correo separado (fuera de alcance del MVP).

### F-03 Desactivar / reactivar usuario
- Administrador puede desactivar y reactivar cuentas de Profesionales y Pacientes de su organización.
- Al desactivar, la sesión activa se invalida inmediatamente.
- Los datos del usuario desactivado se conservan; no se eliminan.
- Un usuario desactivado no puede iniciar sesión.

### F-04 Asignar paciente a profesional
- Administrador puede asignar o reasignar un Paciente de un Profesional a otro dentro de la misma organización.
- La reasignación requiere que el Paciente haya aceptado (ver D-08 en actors-and-roles.md: el paciente puede aceptar que su caso sea referido).
- El expediente del Paciente sigue accesible al Profesional anterior solo en modo lectura hasta que el Administrador revoque el acceso.

### F-05 Ver listado de usuarios
- Administrador ve la lista de todos los Profesionales y Pacientes de su organización.
- Profesional ve la lista de sus propios Pacientes.
- Super Administrador ve todas las organizaciones y todos sus usuarios.

---

## Reglas de negocio

1. Un usuario pertenece a exactamente una organización; no puede ser miembro de dos organizaciones simultáneamente en el MVP.
2. Un Paciente está asignado a exactamente un Profesional activo en cualquier momento.
3. El Administrador no puede ver el contenido clínico de los expedientes; solo ve datos de identificación y estado de cuenta.
4. No existe eliminación de cuentas; solo desactivación lógica.
5. El correo electrónico es único en todo el sistema (no solo por organización).

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `user_id` | Identificador único del usuario |
| `organization_id` | Organización a la que pertenece |
| `role` | `paciente`, `profesional`, `administrador`, `super_administrador` |
| `full_name` | Nombre completo |
| `email` | Correo electrónico (único en el sistema) |
| `account_status` | `activo`, `inactivo`, `pendiente_activacion` |
| `assigned_professional_id` | Solo para Pacientes: Profesional asignado |
| `created_at` | Fecha de creación de la cuenta |
| `created_by` | Usuario que creó esta cuenta |

---

## Dependencias

- AUTH-001 — gestiona credenciales y sesiones de los usuarios creados aquí.
- EXPEDIENTE-003 — al crear un Paciente, se inicializa su expediente clínico.
- Log de auditoría — registra creación, edición y cambios de estado de usuarios.

---

## Fuera de alcance del MVP

- Roles personalizados o permisos granulares por institución
- Eliminación permanente de cuentas
- Cambio de correo electrónico de usuario activo
- Importación masiva de usuarios (CSV u otro formato)
- Gestión de organizaciones (alta/baja de organizaciones) — es tarea del Super Administrador con acceso directo
