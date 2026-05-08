# AUTH-001 — Autenticación y Sesiones

## Propósito

Gestionar el acceso seguro a Catholizare para todos los roles: Paciente, Profesional, Administrador y Super Administrador. Controlar el ciclo de vida de la sesión y proteger las credenciales.

---

## Actores

| Actor | Interacción |
|---|---|
| Paciente | Inicia sesión en el portal del paciente |
| Profesional | Inicia sesión en el panel del profesional |
| Administrador | Inicia sesión en el panel de administración |
| Super Administrador | Inicia sesión con acceso completo |

---

## Funcionalidades

### F-01 Inicio de sesión
- El usuario introduce correo electrónico y contraseña.
- El sistema valida credenciales y retorna un token de sesión.
- Si las credenciales son incorrectas, el sistema muestra error genérico sin revelar si el correo existe.
- Después de 5 intentos fallidos consecutivos, la cuenta se bloquea temporalmente por 15 minutos.

### F-02 Cierre de sesión
- El usuario puede cerrar sesión en cualquier momento.
- Al cerrar sesión, el token se invalida en el servidor.
- La sesión expira automáticamente tras un periodo de inactividad (duración a definir en D-09 según stack).

### F-03 Recuperación de contraseña
- El usuario solicita recuperación introduciendo su correo electrónico.
- El sistema envía un enlace de restablecimiento con vigencia de 1 hora.
- El enlace es de un solo uso; se invalida tras el primer uso o al vencer.
- La nueva contraseña debe cumplir la política de seguridad (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número).

### F-04 Creación de cuenta (solo por invitación)
- Los pacientes y profesionales no se registran de forma autónoma.
- La cuenta se crea por el Administrador o el Profesional (según rol objetivo) y se envía un correo de activación.
- El correo de activación contiene un enlace con vigencia de 72 horas para que el usuario establezca su contraseña.

### F-05 Cambio de contraseña autenticado
- Un usuario autenticado puede cambiar su contraseña desde su perfil.
- El sistema requiere la contraseña actual antes de aceptar la nueva.

---

## Reglas de negocio

1. Cada rol accede a una interfaz diferente: portal del paciente, panel del profesional, panel de administración.
2. El token de sesión debe incluir el rol del usuario para que cada capa del sistema aplique las reglas de acceso correctas.
3. No existe login social (Google, Facebook, etc.) en el MVP.
4. La autenticación multifactor (MFA) no es obligatoria en el MVP, pero el diseño debe permitir activarla en el futuro sin cambios estructurales.
5. Los Super Administradores no tienen interfaz de registro; sus cuentas se crean directamente en la base de datos por el equipo de Catholizare.

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `email` | Identificador único del usuario |
| `password_hash` | Contraseña almacenada con hash (nunca en texto plano) |
| `role` | Uno de: `paciente`, `profesional`, `administrador`, `super_administrador` |
| `account_status` | `activo`, `inactivo`, `bloqueado`, `pendiente_activacion` |
| `last_login_at` | Timestamp del último inicio de sesión exitoso |
| `failed_attempts` | Contador de intentos fallidos consecutivos |
| `locked_until` | Timestamp hasta el que la cuenta está bloqueada |

---

## Requisitos normativos

- **NOM-024-SSA3-2012**: las contraseñas deben almacenarse con hash seguro (bcrypt o equivalente). Las sesiones deben tener tiempo de expiración. Los intentos de acceso fallidos deben registrarse en el log de auditoría.
- **NOM-024-SSA3-2012**: toda acción de autenticación (login exitoso, login fallido, cierre de sesión, cambio de contraseña) queda registrada en el log de auditoría con timestamp y dirección IP.

---

## Dependencias

- Módulo de Gestión de Usuarios (USERS-002) — provee la entidad usuario sobre la que AUTH opera.
- Log de auditoría — recibe eventos de autenticación.
- Servicio de correo electrónico — envía enlace de activación y recuperación de contraseña.

---

## Fuera de alcance del MVP

- Autenticación multifactor (MFA)
- Login con Google / SSO
- Gestión de dispositivos de confianza
- Sesiones múltiples concurrentes con control granular
