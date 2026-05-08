# GCAL-009 — Integración Google Calendar

## Propósito

Mantener la agenda de Catholizare sincronizada bidireccionalmente con el Google Calendar personal del Profesional. Las citas creadas en Catholizare aparecen en Google Calendar y los cambios hechos en Google Calendar se reflejan en la agenda de Catholizare.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Conecta su Google Calendar y opera la agenda desde cualquiera de las dos plataformas |

---

## Funcionalidades

### F-01 Conectar Google Calendar
- El Profesional autoriza a Catholizare el acceso a su Google Calendar mediante OAuth 2.0.
- La conexión es por cuenta de Google del Profesional; cada Profesional tiene su propia conexión.
- El sistema almacena el token de acceso de forma segura.
- El Profesional puede desconectar su Google Calendar en cualquier momento desde la configuración.

### F-02 Sincronización de Catholizare a Google Calendar
- Toda cita creada, editada o cancelada en Catholizare se propaga automáticamente al Google Calendar del Profesional.
- El evento en Google Calendar incluye: título (nombre del paciente o pseudónimo configurado), fecha, hora, duración y enlace de Zoom si aplica.
- Si el Profesional no tiene Google Calendar conectado, la cita solo se guarda en Catholizare.

### F-03 Sincronización de Google Calendar a Catholizare
- Los cambios realizados directamente en Google Calendar (editar, cancelar, mover eventos creados por Catholizare) se reflejan en la agenda de Catholizare.
- Catholizare escucha cambios en Google Calendar mediante webhooks de la Google Calendar API.
- Solo se sincronizan eventos que fueron creados originalmente por Catholizare; eventos ajenos de Google Calendar no se importan a Catholizare.

### F-04 Detección de conflictos
- Si Google Calendar detecta un evento existente en el mismo horario al momento de crear una cita en Catholizare, el sistema muestra una advertencia al Profesional.
- La advertencia no bloquea la creación; el Profesional decide si continúa.

### F-05 Manejo de token expirado o conexión perdida
- Si el token de Google Calendar expira o el Profesional revoca el acceso, Catholizare detecta el error en la siguiente sincronización.
- El sistema notifica al Profesional que debe reconectar su Google Calendar.
- Durante el tiempo sin conexión, las citas siguen creándose en Catholizare; no hay pérdida de datos.

---

## Reglas de negocio

1. La integración de Google Calendar es **opcional** por Profesional; Catholizare funciona sin ella.
2. Solo se sincronizan con Google Calendar las citas de los pacientes del Profesional; no se importan eventos ajenos de Google Calendar a Catholizare.
3. El título del evento en Google Calendar **no debe exponer datos clínicos sensibles**. El título predeterminado es el nombre del paciente; el Profesional puede configurar un pseudónimo.
4. El token de OAuth se almacena cifrado (requerimiento NOM-024-SSA3-2012).
5. La sincronización es asíncrona; puede haber un retraso breve entre una acción en Catholizare y su reflejo en Google Calendar.

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `gcal_connection_id` | Identificador de la conexión |
| `professional_id` | Profesional al que pertenece la conexión |
| `google_account_email` | Correo de la cuenta de Google conectada |
| `access_token` | Token de acceso OAuth (almacenado cifrado) |
| `refresh_token` | Token de refresco OAuth (almacenado cifrado) |
| `token_expires_at` | Fecha de expiración del access token |
| `webhook_channel_id` | ID del canal de webhook para notificaciones de cambios |
| `connection_status` | `conectado`, `expirado`, `desconectado` |

---

## Dependencias

- AGENDA-008 — es el productor de eventos que se sincronizan; la integración GCAL es un efecto secundario de las acciones en la agenda.
- AUTH-001 — el flujo OAuth de Google requiere que el Profesional esté autenticado.
- API de Google Calendar v3 — proveedor externo.

---

## Fuera de alcance del MVP

- Importar eventos externos de Google Calendar a Catholizare (solo se sincronizan los creados por Catholizare)
- Soporte para múltiples calendarios de Google por Profesional (solo el calendario principal)
- Sincronización con otros proveedores de calendario (Outlook, Apple Calendar)
- Gestión de disponibilidad/horarios basada en Google Calendar
