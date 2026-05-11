# AGENDA-008 — Agenda y Gestión de Citas

## Propósito

Permitir al Profesional gestionar sus citas con Pacientes desde Catholizare, con sincronización bidireccional con Google Calendar y generación automática de enlace Zoom para cada sesión.

La agenda también puede vincular citas con procesos terapéuticos y con la ruta terapéutica editable del proceso TCC, sin crear o modificar sesiones automáticamente sin confirmación del Profesional.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Crea, edita y cancela citas; gestiona su agenda y vincula citas con procesos terapéuticos. |
| Paciente | Ve sus citas programadas en el portal; puede solicitar cancelación o reprogramación vía mensaje. |

---

## Funcionalidades

### F-01 Ver agenda

- El Profesional accede a su agenda con vistas: día, semana y mes.
- La agenda muestra las citas de todos sus Pacientes.
- Cada cita muestra: nombre del Paciente, fecha, hora, duración, tipo, modalidad y estado.

---

### F-02 Crear cita

- El Profesional crea una cita seleccionando: Paciente, fecha, hora, duración y tipo.
- Si el tipo es videollamada, el sistema genera automáticamente un enlace de reunión de Zoom.
- La cita creada en Catholizare se sincroniza a Google Calendar del Profesional, según GCAL-009.
- El Paciente recibe notificación de la nueva cita por el canal definido para el MVP.

---

### F-03 Editar cita

- El Profesional puede editar fecha, hora y duración de una cita futura.
- La edición se sincroniza a Google Calendar.
- El Paciente recibe notificación del cambio.

---

### F-04 Cancelar cita

- El Profesional puede cancelar una cita futura.
- La cancelación se refleja en Google Calendar.
- El Paciente recibe notificación de la cancelación.

---

### F-05 Solicitud de cancelación o reprogramación por el Paciente

- El Paciente puede enviar un mensaje al Profesional para solicitar cancelación o reprogramación de una cita.
- Esta funcionalidad es un canal de comunicación básico, no un flujo de aprobación automatizado.
- El Profesional recibe la solicitud y decide si cancela o reprograma manualmente.

---

### F-06 Vincular cita a proceso terapéutico

- Al crear una cita, el Profesional puede vincularla a un proceso terapéutico activo del Paciente.
- El vínculo permite navegar desde la cita al contexto del proceso y viceversa.

---

### F-07 Enlace de videollamada para el Paciente

- El Paciente ve el enlace de Zoom de su próxima cita en su portal.
- El enlace visible para el Paciente debe ser únicamente el enlace de participante.
- El enlace solo es visible cuando la cita está dentro de la ventana definida de acceso, por ejemplo 24 horas antes.

---

### F-08 Vincular citas a ruta terapéutica TCC

El Profesional puede vincular una cita a una sesión planeada dentro de la ruta terapéutica editable de PROCESO-TCC-006.

Al vincular una cita con una sesión TCC, el sistema puede mostrar:

- número de sesión planeada;
- objetivo de sesión;
- fase del proceso TCC;
- intervención sugerida;
- nota clínica pendiente;
- proceso TCC relacionado.

Restricciones:

- La ruta terapéutica TCC no crea citas automáticamente.
- Cualquier cita debe ser creada, editada o confirmada desde AGENDA-008 por el Profesional.
- Si el plan TCC sugiere reprogramar próximas sesiones, el Profesional debe confirmar manualmente los cambios en agenda.
- La agenda no modifica el plan TCC automáticamente.

---

## Reglas de negocio

1. El Profesional no puede crear dos citas con el mismo Paciente en la misma franja horaria sin advertencia del sistema.
2. No existe sistema de disponibilidad pública para que los Pacientes reserven citas por sí solos en el MVP.
3. Las citas pasadas son de solo lectura; no se editan ni cancelan desde operación ordinaria.
4. Una cita cancelada conserva el registro histórico; no se elimina.
5. Si Google Calendar tiene ya un evento en el mismo horario, Catholizare muestra una advertencia de conflicto pero no bloquea la creación; el Profesional decide.
6. Si la cita está vinculada a una sesión TCC, la modificación de la cita no modifica automáticamente la ruta terapéutica ni el plan TCC.
7. Si la ruta TCC se ajusta, no se modifican citas automáticamente sin confirmación del Profesional.
8. Las citas pueden vincularse a notas clínicas, procesos terapéuticos y sesiones planeadas, pero la nota clínica formal se gestiona desde NOTAS-004.

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `appointment_id` | Identificador único de la cita |
| `professional_id` | Profesional de la cita |
| `patient_id` | Paciente de la cita |
| `process_id` | Proceso terapéutico vinculado, opcional |
| `tcc_process_id` | Proceso TCC relacionado, si aplica |
| `tcc_session_plan_item_id` | Sesión planeada de la ruta TCC relacionada, si aplica |
| `scheduled_at` | Fecha y hora de inicio |
| `duration_minutes` | Duración en minutos |
| `type` | `presencial`, `videollamada` |
| `zoom_join_url` | Enlace de participante para el Paciente, si aplica |
| `zoom_start_url` | Enlace de anfitrión para el Profesional, si aplica |
| `google_calendar_event_id` | ID del evento en Google Calendar |
| `status` | `programada`, `completada`, `cancelada` |
| `cancellation_reason` | Motivo de cancelación, opcional |
| `created_at` | Fecha de creación |
| `updated_at` | Fecha de última actualización |

---

## Dependencias

- USERS-002 — los actores de la cita existen en el sistema.
- EXPEDIENTE-003 — las citas se relacionan con el expediente clínico.
- NOTAS-004 — las citas pueden generar o vincular notas clínicas.
- PROCESO-GENERAL-005 — vínculo entre cita y proceso general.
- PROCESO-TCC-006 — ruta terapéutica editable por sesiones y vinculación de citas al proceso TCC.
- GCAL-009 — sincronización de citas con Google Calendar.
- ZOOM-010 — generación de enlace de reunión para citas de videollamada.
- PORTAL-011 — el Paciente ve sus citas y enlaces permitidos en el portal.
- LOG-014 — auditoría y trazabilidad.
- PRIV-015 — privacidad, minimización y tratamiento de datos.

---

## Fuera de alcance del MVP

- Reserva de citas por parte del Paciente.
- Gestión pública de disponibilidad y horarios del Profesional.
- Recordatorios automáticos por SMS o WhatsApp.
- Integración con otros proveedores de videollamada distintos a Zoom.
- Pago de consultas en línea.
- Creación automática de citas desde la ruta terapéutica TCC sin confirmación del Profesional.
- Reprogramación automática de citas por IA.
