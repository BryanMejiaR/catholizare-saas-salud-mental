# Resend + Supabase Auth SMTP

## Objetivo

Evitar el limite bajo del correo transaccional gratuito de Supabase para flujos de autenticacion:

- Invitaciones de usuarios.
- Recuperacion de contrasena.
- Confirmaciones futuras de seguridad.

## Donde se configura

Esta integracion se configura en Supabase Dashboard, no en Railway ni en variables de entorno de Next.js. Catholizare sigue llamando a Supabase Auth (`inviteUserByEmail` y `resetPasswordForEmail`); Supabase es quien envia el correo usando el SMTP configurado.

## Pasos

1. Crear o usar una cuenta de Resend.
2. En Resend, agregar y verificar el dominio que se usara para correos, por ejemplo `catholizare.com`.
3. Configurar los registros DNS que Resend indique: SPF, DKIM y, si aplica, DMARC.
4. Crear una API key SMTP en Resend.
5. En Supabase Dashboard abrir el proyecto.
6. Ir a `Authentication` -> `Emails` -> `SMTP Settings`.
7. Activar `Enable custom SMTP`.
8. Usar estos valores:
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend`
   - Password: la API key SMTP de Resend
   - Sender email: un correo del dominio verificado, por ejemplo `no-reply@catholizare.com`
   - Sender name: `Catholizare`
9. En `Authentication` -> `URL Configuration`, confirmar:
   - Site URL: URL publica real de Railway, por ejemplo `https://<app>.up.railway.app`
   - Redirect URLs: incluir `https://<app>.up.railway.app/auth/callback`
10. En Railway, confirmar que `NEXT_PUBLIC_APP_URL` usa la misma URL publica con `https://`.

## Seguridad

- No guardar API keys de Resend en el repositorio.
- Para correos de autenticacion, Supabase usa su SMTP configurado en Dashboard.
- Para correos transaccionales propios de la app, como codigos de consentimiento informado y copias legales, Railway y `.env.local` deben tener `RESEND_API_KEY` y `RESEND_FROM_EMAIL`.
- La API key de `RESEND_API_KEY` debe ser una API key de Resend para HTTP API, no la contrasena SMTP configurada dentro de Supabase.
- Usar un correo remitente del dominio verificado para reducir rechazos o spam.
- Mantener los links de Supabase Auth apuntando a `/auth/callback`; no apuntar directo a `/auth/update-password`.

## Variables de entorno de la app

Estas variables se configuran en Railway y, para pruebas locales, en `.env.local`:

```env
RESEND_API_KEY=
RESEND_FROM_EMAIL=Catholizare <no-reply@tudominio-verificado.com>
CATHOLIZARE_LEGAL_EMAIL=catholizare@gmail.com
```

Si `RESEND_API_KEY` o `RESEND_FROM_EMAIL` faltan, la app no podra enviar el codigo de 4 digitos para firmar consentimiento informado aunque las invitaciones de Supabase Auth si funcionen.

## Prueba minima

1. Crear un usuario QA desde `/admin/users`.
2. Abrir el correo de invitacion.
3. Confirmar que el link abre la URL publica de Railway, no `localhost`.
4. Crear contrasena.
5. Verificar que el usuario queda `activo` en `profiles` y puede iniciar sesion.

## Nota

Resend resuelve el limite de envio, pero no corrige por si solo errores de sesion o cookies. Si el correo llega y el callback abre `/auth/update-password`, cualquier fallo posterior debe revisarse en Railway logs y Supabase Auth logs.
