# ADMIN-012 Technical Contract

## Scope

ADMIN-012 adds the first administrative reporting and audit surfaces.

Implemented:

- Admin operational reports at `/admin/reports`.
- Super Admin global reports at `/super-admin/reports`.
- Super Admin audit log viewer at `/super-admin/audit`.
- Links from `/admin` and `/super-admin`.

Already implemented before this slice:

- Admin user management at `/admin/users`.
- Super Admin administrative user management at `/super-admin/users`.

## Data Minimization

Administrative report queries only select:

- profile role and account status;
- expediente status;
- appointment status and professional id;
- professional display name/email for operational assignment counts.

The admin panel does not select or render:

- clinical notes;
- clinical history text;
- therapeutic summaries;
- diagnoses;
- hypotheses;
- consultation reasons;
- psychological assessment content;
- AI clinical drafts.

## Permissions

Route access:

- `/admin/reports`: `administrador`.
- `/super-admin/reports`: `super_administrador`.
- `/super-admin/audit`: `super_administrador`.

Audit logs remain readable only by Super Admin according to existing RLS.

## Server Layer

Queries:

- `getAdminOperationalReport`
- `getRecentAuditLogs`

Audit actions:

- `admin_operational_report_read`
- `admin_audit_log_read`

## UI

Components:

- `OperationalReport`
- `AuditLogsTable`

The audit table intentionally hides metadata, IP address, and user agent in this MVP slice to avoid
accidental exposure of noisy or sensitive operational detail in the initial UI.

## QA Checklist

- Login as Administrador and confirm `/admin/reports` loads.
- Confirm Administrador cannot access `/super-admin/audit`.
- Login as Super Administrador and confirm `/super-admin/reports` and `/super-admin/audit` load.
- Confirm reports only show counts and statuses, not clinical free text.
- Confirm opening reports writes `admin_operational_report_read`.
- Confirm opening audit writes `admin_audit_log_read`.
