# ZOOM-010 — Integración Zoom

## Propósito

Generar automáticamente enlaces de reunión de Zoom al crear citas de videollamada en Catholizare, y presentarlos al Profesional y al Paciente en los lugares apropiados de la interfaz.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Las citas de videollamada tienen un enlace de Zoom generado automáticamente |
| Paciente | Ve el enlace de Zoom de su próxima cita en el portal |

---

## Funcionalidades

### F-01 Generar enlace de Zoom al crear cita de videollamada
- Cuando el Profesional crea una cita con tipo `videollamada`, Catholizare llama a la API de Zoom para crear una reunión.
- Zoom devuelve un enlace de reunión único para esa cita.
- El enlace se almacena en la cita y se muestra al Profesional en la vista de detalle de la cita.

### F-02 Mostrar enlace al paciente
- El Paciente ve el enlace de Zoom de su próxima cita en su portal (ver PORTAL-011).
- El enlace se muestra con anticipación suficiente para que el Paciente lo tenga disponible.

### F-03 Actualizar o regenerar enlace al editar cita
- Si el Profesional edita la fecha u hora de una cita de videollamada, Catholizare actualiza el enlace de Zoom en la reunión existente.
- Si la actualización falla, Catholizare genera una nueva reunión y reemplaza el enlace.

### F-04 Cancelar reunión de Zoom al cancelar cita
- Cuando el Profesional cancela una cita de videollamada, Catholizare cancela la reunión correspondiente en Zoom.
- Si la cancelación en Zoom falla, se registra el error pero la cita queda cancelada en Catholizare de todas formas.

### F-05 Conexión de la cuenta Zoom del Profesional
- El Profesional conecta su cuenta Zoom a Catholizare mediante OAuth 2.0 de Zoom.
- Las reuniones se crean bajo la cuenta del Profesional (las reuniones aparecen en su panel de Zoom).
- El Profesional puede desconectar Zoom desde la configuración.

---

## Reglas de negocio

1. La integración con Zoom es **opcional** por Profesional; si no está conectada, el Profesional puede agregar un enlace manual en el campo de notas de la cita.
2. Los enlaces de Zoom no se exponen en ningún lugar accesible públicamente; solo en el panel del Profesional y en el portal del Paciente autenticado.
3. El token OAuth de Zoom se almacena cifrado (requerimiento NOM-024-SSA3-2012).
4. Catholizare no accede al contenido de las videollamadas (audio, video, grabaciones).

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `zoom_connection_id` | Identificador de la conexión |
| `professional_id` | Profesional al que pertenece la conexión |
| `zoom_user_id` | ID del usuario en la plataforma Zoom |
| `access_token` | Token de acceso OAuth de Zoom (almacenado cifrado) |
| `refresh_token` | Token de refresco OAuth de Zoom (almacenado cifrado) |
| `connection_status` | `conectado`, `expirado`, `desconectado` |

En la cita (AGENDA-008):
| Campo | Descripción |
|---|---|
| `zoom_meeting_id` | ID de la reunión en Zoom |
| `zoom_link` | URL de la reunión para unirse |

---

## Dependencias

- AGENDA-008 — Zoom se activa al crear/editar/cancelar citas de videollamada.
- AUTH-001 — el flujo OAuth de Zoom requiere que el Profesional esté autenticado.
- PORTAL-011 — el enlace de Zoom se muestra al Paciente en el portal.
- API de Zoom — proveedor externo.

---

## Fuera de alcance del MVP

- Grabación automática de sesiones en Zoom
- Sala de espera virtual de Zoom integrada en Catholizare
- Soporte para otros proveedores de videollamada (Google Meet, Teams)
- Videollamada embebida dentro de Catholizare
