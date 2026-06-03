# AGENDA-008 Technical Contract

## Scope

AGENDA-008 introduces the base appointment model for professionals and patients.
The implemented MVP slice covers:

- Professional appointment list at `/professional/agenda`.
- Appointment creation for active patients with an active expediente owned by the professional.
- Appointment cancellation with immutable historical retention.
- Base database fields needed by GCAL-009 and ZOOM-010.
- Optional Google Calendar sync for create/cancel when GCAL-009 is configured.
- `notas_clinicas.appointment_id` foreign key to support future note linkage.

Zoom meeting creation, patient portal visibility, patient reschedule requests, and appointment
editing are intentionally left to their dedicated specs. Google Calendar bidirectional webhooks are
tracked in GCAL-009.

## Database

Migration: `supabase/migrations/202605290001_agenda_citas_base.sql`

New enums:

- `public.appointment_type`: `presencial`, `videollamada`
- `public.appointment_status`: `programada`, `completada`, `cancelada`

New table:

- `public.citas`

Important columns:

- `professional_id`: owning professional profile.
- `patient_id`: patient profile.
- `process_id`: optional therapeutic process link.
- `tcc_process_id`: optional TCC process link.
- `tcc_session_plan_item_id`: optional TCC plan item reference.
- `scheduled_at`: appointment start.
- `duration_minutes`: appointment duration.
- `type`: appointment modality.
- `status`: lifecycle status.
- `zoom_meeting_id`, `zoom_join_url`, `zoom_start_url`: reserved for ZOOM-010.
- `google_calendar_event_id`: reserved for GCAL-009.
- `cancellation_reason`, `cancelled_at`, `cancelled_by_user_id`: cancellation trace.

Existing table updated:

- `public.notas_clinicas.appointment_id` now references `public.citas(id)`.

## Permissions And RLS

`public.citas` has RLS enabled.

Policies:

- Professionals can select their own appointments.
- Professionals can insert appointments where `professional_id = auth.uid()`.
- Professionals can update their own appointments.
- Patients can select their own appointments.

Physical deletion is revoked for `authenticated` and `anon`.

Database triggers enforce:

- The patient must have role `paciente`.
- The professional must have role `profesional`.
- Linked processes must belong to the same professional and patient.
- Cancelled appointments require cancellation metadata.
- Cancelled appointments are read-only.
- Identity fields are immutable after insert.

## Server Layer

Actions:

- `createAppointmentAction`
- `cancelAppointmentAction`

Queries:

- `getAppointmentsForProfessional`
- `getAgendaPatientOptions`

Security behavior:

- Only active professionals can create or cancel appointments.
- Creation requires an active expediente for the selected patient.
- Past appointments are read-only from the action layer.
- Audit log actions use `appointment_create`, `appointment_cancel`, and `appointment_read`.
- Google Calendar sync failures are reported separately and do not rollback clinical operations.
- Audit failures are isolated through `safeWriteAuditLog`.

## UI

Professional route:

- `/professional/agenda`

Components:

- `CreateAppointmentForm`
- `AppointmentsTable`

Current UI intentionally exposes only creation and cancellation. Editing, calendar views by
day/week/month, Zoom creation, and Google Calendar webhooks are pending specs.

## Environment

AGENDA-008 alone does not require new environment variables. GCAL-009 adds optional integration
variables.

Expected future specs:

- ZOOM-010 will add Zoom API variables.

## QA Checklist

- Apply migration `202605290001_agenda_citas_base.sql`.
- Login as a QA professional.
- Confirm `/professional/agenda` is visible from `/professional`.
- Create a future appointment for a patient with an active expediente.
- Confirm creating for an unavailable or inactive patient is denied.
- Cancel a future appointment and confirm it remains visible as `cancelada`.
- Confirm cancelled and past appointments are not cancellable from the UI.
- Confirm patient portal appointment exposure remains pending until PORTAL-011.
