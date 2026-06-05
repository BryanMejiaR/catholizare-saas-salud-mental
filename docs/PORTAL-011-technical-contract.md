# PORTAL-011 Technical Contract

## Scope

PORTAL-011 adds the first patient portal dashboard.

Implemented:

- Patient-only route at `/portal`.
- Published therapeutic summary display.
- Upcoming appointments and basic appointment history.
- Zoom participant link access inside a restricted time window.
- Patient appointment change requests.
- Patient experience reviews for past appointments.
- Audit logs for portal dashboard read, appointment requests, reviews, and Zoom link access.

Pending:

- Referral acceptance/rejection flows.
- Professional inbox UI for patient requests.
- Patient notification system.
- Portal-specific evaluation modules from EVAL-014.

## Data Minimization

The portal does not show:

- Full clinical record.
- Clinical notes.
- Internal diagnoses or hypotheses.
- Internal conceptualizations.
- Psychological test details.
- Unapproved AI drafts.
- Zoom host URL.
- Other patients' information.

The portal only queries appointment metadata, professional display data, published summaries, own
requests, and own reviews.

## Database

Migration: `supabase/migrations/202606010001_patient_portal_interactions.sql`

New enums:

- `public.appointment_request_type`: `cancelacion`, `reprogramacion`
- `public.patient_request_status`: `recibida`, `revisada`, `resuelta`, `rechazada`

New tables:

- `public.patient_appointment_requests`
- `public.patient_experience_reviews`

## Permissions And RLS

`patient_appointment_requests`:

- Patients can read and create their own requests.
- Professionals can read and update requests for their appointments.
- Physical deletion is revoked.

`patient_experience_reviews`:

- Patients can read and create their own reviews.
- Professionals can read reviews for their appointments.
- Client update and physical deletion are revoked.

Database triggers enforce:

- Appointment ownership must match patient and professional.
- Requests only apply to future scheduled appointments.
- Reviews only apply to past appointments.
- One review per appointment per patient.

## Zoom Link Access

The portal never exposes `zoom_start_url`.

Patients can open `zoom_join_url` only when:

- appointment is `programada`;
- appointment has a participant URL;
- appointment starts within 24 hours;
- appointment has not ended.

Opening the link goes through a server action so access is audited before redirecting to Zoom.

## Server Layer

Queries:

- `getPortalDashboard`

Actions:

- `createAppointmentRequestAction`
- `submitExperienceReviewAction`
- `openZoomJoinUrlAction`

Audit actions:

- `portal_dashboard_read`
- `portal_summary_read`
- `portal_appointments_read`
- `portal_appointment_request`
- `portal_experience_review`
- `portal_zoom_join`

## QA Checklist

- Apply migration `202606010001_patient_portal_interactions.sql`.
- Login as a QA patient and confirm `/portal` loads.
- Confirm no clinical notes or full expediente fields appear.
- Publish a therapeutic summary and confirm it appears only for the owning patient.
- Create a future appointment and confirm it appears in upcoming appointments.
- Confirm the Zoom join button appears only inside the 24-hour window and never exposes host URL.
- Submit a cancellation or reschedule request and confirm it does not modify the appointment.
- Submit one review for a past appointment and confirm duplicate reviews are rejected.
