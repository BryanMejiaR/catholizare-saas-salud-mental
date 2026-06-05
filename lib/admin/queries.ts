import "server-only";

import type { AuthProfile } from "@/lib/auth/types";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AdminAuditLog, AdminMetric, AdminOperationalReport } from "@/lib/admin/types";

type ProfileRow = {
  id: string;
  role: string;
  account_status: string;
  full_name: string;
  email: string;
  assigned_professional_ids: string[] | null;
};

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<T, number>>(
    (counts, value) => ({
      ...counts,
      [value]: (counts[value] ?? 0) + 1
    }),
    {} as Record<T, number>
  );
}

function mapCounts(counts: Record<string, number>, labels: Record<string, string>) {
  return Object.entries(labels).map(([key, label]) => ({
    label,
    value: counts[key] ?? 0
  })) satisfies AdminMetric[];
}

export async function getAdminOperationalReport(profile: AuthProfile) {
  const supabaseAdmin = createSupabaseAdminClient();
  const [
    { data: profiles, error: profilesError },
    { data: expedientes, error: expedientesError },
    { data: appointments, error: appointmentsError }
  ] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, role, account_status, full_name, email, assigned_professional_ids"),
    supabaseAdmin.from("expedientes").select("id, status"),
    supabaseAdmin.from("citas").select("id, status, professional_id")
  ]);

  if (profilesError || expedientesError || appointmentsError) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "admin_operational_report_read",
      entityType: "admin_reports",
      result: "error",
      context: "audit_admin_operational_report_error"
    });

    throw new Error("Unable to load administrative operational report.");
  }

  const profileRows = (profiles ?? []) as ProfileRow[];
  const expedienteRows = (expedientes ?? []) as Array<{ status: string }>;
  const appointmentRows = (appointments ?? []) as Array<{ status: string; professional_id: string }>;
  const roleCounts = countBy(profileRows.map((row) => row.role));
  const activeProfessionals = profileRows.filter(
    (row) => row.role === "profesional" && row.account_status === "activo"
  );
  const appointmentsByProfessional = appointmentRows.reduce<Record<string, number>>((counts, row) => {
    counts[row.professional_id] = (counts[row.professional_id] ?? 0) + 1;
    return counts;
  }, {});
  const patientsByProfessional = activeProfessionals.map((professional) => ({
    professional_id: professional.id,
    full_name: professional.full_name,
    email: professional.email,
    assigned_patients_count: profileRows.filter((row) =>
      row.assigned_professional_ids?.includes(professional.id)
    ).length,
    appointments_count: appointmentsByProfessional[professional.id] ?? 0
  }));

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "admin_operational_report_read",
    entityType: "admin_reports",
    result: "success",
    metadata: {
      users_count: profileRows.length,
      appointments_count: appointmentRows.length
    },
    context: "audit_admin_operational_report_success"
  });

  return {
    users: [
      ...mapCounts(roleCounts, {
        paciente: "Pacientes",
        profesional: "Profesionales",
        administrador: "Administradores",
        super_administrador: "Super administradores"
      }),
      {
        label: "Usuarios activos",
        value: profileRows.filter((row) => row.account_status === "activo").length
      },
      {
        label: "Usuarios inactivos o bloqueados",
        value: profileRows.filter((row) => row.account_status !== "activo").length
      }
    ],
    expedientes: mapCounts(countBy(expedienteRows.map((row) => row.status)), {
      activo: "Expedientes activos",
      archivado: "Expedientes archivados",
      bloqueado: "Expedientes bloqueados"
    }),
    appointments: mapCounts(countBy(appointmentRows.map((row) => row.status)), {
      programada: "Citas programadas",
      completada: "Citas completadas",
      cancelada: "Citas canceladas"
    }),
    professionals: patientsByProfessional
  } satisfies AdminOperationalReport;
}

export async function getRecentAuditLogs(profile: AuthProfile) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("audit_logs")
    .select("id, user_id, role, action, entity_type, entity_id, result, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "admin_audit_log_read",
      entityType: "audit_logs",
      result: "error",
      context: "audit_admin_audit_log_read_error"
    });

    throw new Error(`Unable to load audit logs: ${error.message}`);
  }

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "admin_audit_log_read",
    entityType: "audit_logs",
    result: "success",
    metadata: {
      count: data?.length ?? 0
    },
    context: "audit_admin_audit_log_read_success"
  });

  return (data ?? []) satisfies AdminAuditLog[];
}
