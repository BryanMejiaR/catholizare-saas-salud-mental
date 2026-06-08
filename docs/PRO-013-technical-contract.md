# PRO-013 Technical Contract

## Scope

PRO-013 adds the first Catholizare Pro content surfaces.

Implemented:

- Professional resources page at `/professional/resources`.
- Dashboard Pro banners and upcoming Pro events for professionals.
- Admin content management at `/admin/pro`.
- Super Admin content management at `/super-admin/pro`.
- Resource, banner, event, and banner dismissal persistence.

Pending:

- WordPress synchronization from `profesionales.catholizare.com`.
- File uploads.
- Advanced frequency rules.
- Email reminders.
- Editing existing content from the UI.

## Database

Migration: `supabase/migrations/202606020001_catholizare_pro_base.sql`

New enums:

- `public.pro_resource_status`
- `public.pro_resource_type`
- `public.pro_banner_type`
- `public.pro_event_status`

New tables:

- `public.pro_resources`
- `public.pro_banners`
- `public.pro_events`
- `public.pro_banner_dismissals`

## Permissions And RLS

Professional:

- Can read active and currently visible Pro resources.
- Can read active and currently visible Pro banners.
- Can read upcoming programmed Pro events.
- Can create own banner dismissals.

Admin and Super Admin:

- Can manage Pro resources, banners, and events.

Patient:

- No Pro read policy exists for patients.

Physical deletion from authenticated and anonymous clients is revoked.

Server-side professional queries use the service-role client and then apply the same visibility
rules defined in RLS: `status = activo`, `visible_from <= now()`, and `visible_until is null or >
now()`. This keeps the existing server-only query pattern used across the app, but these filters
must stay aligned with the RLS policies.

## Data Safety

Catholizare Pro content is non-clinical.

The module must not store:

- patient names;
- clinical notes;
- diagnoses;
- case formulations;
- assessment results;
- session content;
- AI-generated clinical drafts.

Links must be HTTPS or HTTP URLs. In production, admins should prefer HTTPS external URLs.

## Server Layer

Queries:

- `getProfessionalProDashboard`
- `getAdminProContent`

Actions:

- `createProResourceAction`
- `createProBannerAction`
- `createProEventAction`
- `dismissProBannerAction`

Audit actions:

- `pro_content_read`
- `pro_admin_content_read`
- `pro_resource_create`
- `pro_banner_create`
- `pro_event_create`
- `pro_banner_dismiss`

## UI

Professional:

- `/professional`
- `/professional/resources`

Admin:

- `/admin/pro`

Super Admin:

- `/super-admin/pro`

Banners are inline, dismissible when configured, and never modal/blocking.

## QA Checklist

- Apply migration `202606020001_catholizare_pro_base.sql`.
- Login as Profesional and confirm `/professional/resources` is accessible.
- Confirm Paciente cannot access Pro pages.
- Login as Administrador and create a resource/banner/event from `/admin/pro`.
- Confirm active resource appears to Profesional and inactive content does not.
- Confirm a dashboard banner can be dismissed by a professional.
- Confirm no clinical content is queried or displayed by Pro admin pages.
