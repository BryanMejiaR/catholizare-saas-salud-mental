# AUTH-001 — High-Level Technical Contract

## Alcance

Implementar la base de autenticación y sesiones del MVP usando Supabase Auth con correo y contraseña. Este contrato cubre el scaffold técnico mínimo necesario para que AUTH-001 funcione sin implementar todavía USERS-002 completo ni módulos clínicos.

## Decisiones respetadas

- Stack D-09: Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase Auth, Supabase PostgreSQL con RLS, Sentry.
- No hay login social en el MVP.
- Google OAuth queda fuera de este incremento porque en AUTH-001 no es mecanismo de inicio de sesión; se conectará después con GCAL-009.
- Los roles válidos son exactamente: `paciente`, `profesional`, `administrador`, `super_administrador`.
- No se crean tablas clínicas ni datos de expediente.

## Superficie técnica

- `app/auth/login`: inicio de sesión.
- `app/auth/reset-password`: solicitud de recuperación.
- `app/auth/update-password`: creación o actualización de contraseña desde sesión de recuperación/invitación.
- `app/auth/callback`: intercambio de código Supabase por sesión.
- `app/api/auth/logout`: cierre de sesión.
- `middleware.ts`: protección de rutas y redirección por rol.

## Supabase

Tablas iniciales:

- `organizations`: aislamiento institucional mínimo para USERS-002.
- `profiles`: identidad operacional, rol, estado de cuenta, contador de fallos y bloqueo.
- `auth_audit_logs`: auditoría de eventos de autenticación.

Todas las tablas nacen con RLS activo. No hay políticas de escritura directa para `profiles` desde cliente; USERS-002 deberá usar operaciones de servidor y service role.

## Riesgos y pendientes

- La vigencia real de enlaces de recuperación e invitación se configura en Supabase Auth; debe validarse en el proyecto Supabase Cloud.
- La creación de usuarios por invitación pertenece a USERS-002, aunque AUTH-001 ya soporta el flujo de activación mediante callback y creación de contraseña.
- La sincronización de `app_metadata.role` y `app_metadata.organization_id` deberá quedar cerrada en USERS-002 para que middleware y RLS operen con el mismo origen de verdad.
