# AGENDA-008 — Agenda y Gestión de Citas

## Propósito

Permitir al Profesional gestionar sus citas con pacientes desde Catholizare, con sincronización bidireccional con Google Calendar y generación automática de enlace Zoom para cada sesión.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Crea, edita y cancela citas; gestiona su disponibilidad |
| Paciente | Ve sus citas programadas en el portal; puede solicitar cancelación o reprogramación vía mensaje |

---

## Funcionalidades

### F-01 Ver agenda
- El Profesional accede a su agenda con vistas: día, semana y mes.
- La agenda muestra las citas de todos sus pacientes.
- Cada cita muestra: nombre del paciente, fecha, hora, duración, tipo (presencial/videollamada) y estado.

### F-02 Crear cita
- El Profesional crea una cita seleccionando: paciente, fecha, hora, duración y tipo (presencial o videollamada).
- Si el tipo es videollamada, el sistema genera automáticamente un enlace de reunión de Zoom.
- La cita creada en Catholizare se sincroniza a Google Calendar del Profesional (ver GCAL-009).
- El Paciente recibe notificación de la nueva cita (canal a definir: correo electrónico en el MVP).

### F-03 Editar cita
- El Profesional puede editar fecha, hora y duración de una cita futura.
- La edición se sincroniza a Google Calendar.
- El Paciente recibe notificación del cambio.

### F-04 Cancelar cita
- El Profesional puede cancelar una cita futura.
- La cancelación se refleja en Google Calendar.
- El Paciente recibe notificación de la cancelación.

### F-05 Solicitud de cancelación o reprogramación por el paciente
- El Paciente puede enviar un mensaje al Profesional para solicitar cancelación o reprogramación de una cita (ver actors-and-roles.md).
- Esta funcionalidad es un canal de comunicación básico, no un flujo de aprobación automatizado.
- El Profesional recibe la solicitud y decide si cancela o reprograma manualmente.

### F-06 Vincular cita a proceso terapéutico
- Al crear una cita, el Profesional puede vincularla a un paso del proceso terapéutico activo del paciente.
- El vínculo permite navegar desde la cita al contexto del proceso y viceversa.

### F-07 Enlace de videollamada para el paciente
- El Paciente ve el enlace de Zoom de su próxima cita en su portal.
- El enlace solo es visible cuando la cita está a menos de 24 horas (o el tiempo que se defina en implementación).

---

## Reglas de negocio

1. El Profesional no puede crear dos citas con el mismo paciente en la misma franja horaria.
2. No existe sistema de disponibilidad pública para que los pacientes reserven citas por sí solos en el MVP.
3. Las citas pasadas son de solo lectura; no se editan ni cancelan.
4. Una cita cancelada conserva el registro histórico; no se elimina.
5. Si Google Calendar tiene ya un evento en el mismo horario, Catholizare muestra una advertencia de conflicto pero no bloquea la creación (el Profesional decide).

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `appointment_id` | Identificador único de la cita |
| `professional_id` | Profesional de la cita |
| `patient_id` | Paciente de la cita |
| `process_id` | Proceso terapéutico vinculado (opcional) |
| `scheduled_at` | Fecha y hora de inicio |
| `duration_minutes` | Duración en minutos |
| `type` | `presencial`, `videollamada` |
| `zoom_link` | Enlace de Zoom (null si es presencial) |
| `google_calendar_event_id` | ID del evento en Google Calendar |
| `status` | `programada`, `completada`, `cancelada` |
| `cancellation_reason` | Motivo de cancelación (texto libre, opcional) |

---

## Dependencias

- USERS-002 — los actores de la cita (profesional y paciente) existen en el sistema.
- GCAL-009 — sincronización bidireccional de citas con Google Calendar.
- ZOOM-010 — generación de enlace de reunión para citas de videollamada.
- PORTAL-011 — el paciente ve sus citas en el portal.
- PROCESO-GENERAL-005 / PROCESO-TCC-006 — vínculo entre cita y paso del proceso.

---

## Fuera de alcance del MVP

- Reserva de citas por parte del paciente (self-booking)
- Gestión de disponibilidad y horarios del profesional
- Recordatorios automáticos por SMS o WhatsApp
- Integración con otros proveedores de videollamada (solo Zoom en MVP)
- Pago de consultas en línea
