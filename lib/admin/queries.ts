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

type ExpedienteReportRow = {
  id: string;
  professional_id: string;
  status: string;
  consent_status: string;
  identification_data: Record<string, string | undefined> | null;
  initial_consultation_reason: string | null;
  session_notes_count: number;
  assessments_count: number;
  documents_count: number;
  last_clinical_activity_at: string | null;
};

type AppointmentReportRow = {
  id: string;
  status: string;
  professional_id: string;
  scheduled_at: string;
  type: string;
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

function topMetrics(counts: Record<string, number>, limit = 8) {
  return Object.entries(counts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}

function getAgeFromBirthDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }

  return age >= 0 && age <= 120 ? age : null;
}

function ageBucket(age: number | null) {
  if (age === null) {
    return "Edad no registrada";
  }
  if (age < 18) {
    return "Menores de 18";
  }
  if (age <= 25) {
    return "18 a 25";
  }
  if (age <= 35) {
    return "26 a 35";
  }
  if (age <= 50) {
    return "36 a 50";
  }
  if (age <= 65) {
    return "51 a 65";
  }
  return "66 o mas";
}

function periodMetrics(appointments: AppointmentReportRow[]) {
  const now = new Date();
  const currentMonth = appointments.filter((row) => {
    const date = new Date(row.scheduled_at);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;
  const currentYear = appointments.filter(
    (row) => new Date(row.scheduled_at).getFullYear() === now.getFullYear()
  ).length;
  const currentSemester = now.getMonth() < 6 ? 1 : 2;
  const semesterCount = appointments.filter((row) => {
    const date = new Date(row.scheduled_at);
    const semester = date.getMonth() < 6 ? 1 : 2;
    return date.getFullYear() === now.getFullYear() && semester === currentSemester;
  }).length;

  return [
    { label: "Citas del mes actual", value: currentMonth },
    { label: "Citas del semestre actual", value: semesterCount },
    { label: "Citas del año actual", value: currentYear }
  ];
}

export async function getAdminOperationalReport(profile: AuthProfile) {
  const supabaseAdmin = createSupabaseAdminClient();
  const [
    { data: profiles, error: profilesError },
    { data: expedientes, error: expedientesError },
    { data: appointments, error: appointmentsError },
    { data: procesos, error: procesosError },
    { data: noteTemplates, error: noteTemplatesError },
    { data: notes, error: notesError },
    { data: googleConnections, error: googleConnectionsError },
    { data: zoomConnections, error: zoomConnectionsError }
  ] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("id, role, account_status, full_name, email, assigned_professional_ids"),
    supabaseAdmin
      .from("expedientes")
      .select(
        "id, professional_id, status, consent_status, identification_data, initial_consultation_reason, session_notes_count, assessments_count, documents_count, last_clinical_activity_at"
      ),
    supabaseAdmin.from("citas").select("id, status, professional_id, scheduled_at, type"),
    supabaseAdmin.from("procesos_terapeuticos").select("id, model_type, status, professional_id"),
    supabaseAdmin.from("plantillas_nota_clinica").select("id, professional_id, model_type, name"),
    supabaseAdmin.from("notas_clinicas").select("id, professional_id, note_template_id, note_template_version"),
    supabaseAdmin.from("google_calendar_connections").select("id, professional_id, connection_status"),
    supabaseAdmin.from("zoom_connections").select("id, professional_id, connection_status")
  ]);

  if (
    profilesError ||
    expedientesError ||
    appointmentsError ||
    procesosError ||
    noteTemplatesError ||
    notesError ||
    googleConnectionsError ||
    zoomConnectionsError
  ) {
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
  const expedienteRows = (expedientes ?? []) as ExpedienteReportRow[];
  const appointmentRows = (appointments ?? []) as AppointmentReportRow[];
  const procesoRows = (procesos ?? []) as Array<{ model_type: string; status: string; professional_id: string }>;
  const templateRows = (noteTemplates ?? []) as Array<{
    id: string;
    professional_id: string;
    model_type: string;
    name: string;
  }>;
  const noteRows = (notes ?? []) as Array<{
    professional_id: string;
    note_template_id: string | null;
    note_template_version: number | null;
  }>;
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
  const patients = profileRows.filter((row) => row.role === "paciente");
  const patientExpedientes = expedienteRows.filter((row) => row.identification_data);
  const sexCounts = countBy(
    patientExpedientes.map((row) => row.identification_data?.sex ?? "No registrado")
  );
  const countryCounts = countBy(
    patientExpedientes.map((row) => row.identification_data?.country ?? "No registrado")
  );
  const cityCounts = countBy(
    patientExpedientes.map((row) => row.identification_data?.city ?? "No registrado")
  );
  const ageCounts = countBy(
    patientExpedientes.map((row) => ageBucket(getAgeFromBirthDate(row.identification_data?.birthDate)))
  );
  const reasonCounts = countBy(
    expedienteRows
      .map((row) => row.initial_consultation_reason?.trim().slice(0, 80))
      .filter((value): value is string => Boolean(value))
  );
  const modelCounts = countBy(procesoRows.map((row) => row.model_type));
  const noteTemplateById = new Map(templateRows.map((template) => [template.id, template.name]));
  const noteTemplateUsage = countBy(
    noteRows.map((note) =>
      note.note_template_id ? noteTemplateById.get(note.note_template_id) ?? "Plantilla no disponible" : "Sin plantilla"
    )
  );
  const templatesByProfessional = activeProfessionals.map(
    (professional) => templateRows.filter((template) => template.professional_id === professional.id).length
  );
  const activeRecentExpedientes = expedienteRows.filter((row) => {
    if (!row.last_clinical_activity_at) {
      return false;
    }
    return Date.now() - new Date(row.last_clinical_activity_at).getTime() <= 30 * 86_400_000;
  }).length;
  const connectedGoogle = (googleConnections ?? []).filter(
    (row) => row.connection_status === "conectado"
  ).length;
  const connectedZoom = (zoomConnections ?? []).filter(
    (row) => row.connection_status === "conectado"
  ).length;

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
    appointmentPeriods: periodMetrics(appointmentRows),
    patientMetadata: [
      ...topMetrics(sexCounts, 6).map((metric) => ({ ...metric, label: `Sexo: ${metric.label}` })),
      ...topMetrics(ageCounts, 8).map((metric) => ({ ...metric, label: `Edad: ${metric.label}` })),
      ...topMetrics(countryCounts, 6).map((metric) => ({ ...metric, label: `Pais: ${metric.label}` })),
      ...topMetrics(cityCounts, 8).map((metric) => ({ ...metric, label: `Ciudad: ${metric.label}` }))
    ],
    professionalMetadata: [
      ...topMetrics(modelCounts, 12).map((metric) => ({
        ...metric,
        label: `Modelo terapeutico: ${metric.label}`
      })),
      ...topMetrics(noteTemplateUsage, 12).map((metric) => ({
        ...metric,
        label: `Plantilla de nota: ${metric.label}`
      })),
      {
        label: "Promedio de plantillas por profesional",
        value: average(templatesByProfessional)
      },
      {
        label: "Promedio de sesiones por caso",
        value: average(expedienteRows.map((row) => row.session_notes_count))
      }
    ],
    platformMetadata: [
      { label: "Pacientes registrados", value: patients.length },
      { label: "Expedientes con consentimiento firmado", value: expedienteRows.filter((row) => row.consent_status !== "pendiente").length },
      { label: "Expedientes con actividad ultimos 30 dias", value: activeRecentExpedientes },
      { label: "Evaluaciones promedio por expediente", value: average(expedienteRows.map((row) => row.assessments_count)) },
      { label: "Documentos promedio por expediente", value: average(expedienteRows.map((row) => row.documents_count)) },
      { label: "Profesionales con Google Calendar conectado", value: connectedGoogle },
      { label: "Profesionales con Zoom conectado", value: connectedZoom },
      ...topMetrics(countBy(appointmentRows.map((row) => row.type)), 4).map((metric) => ({
        ...metric,
        label: `Tipo de cita: ${metric.label}`
      }))
    ],
    metadataHighlights: [
      ...topMetrics(reasonCounts, 8).map((metric) => ({
        label: `Motivo de consulta frecuente`,
        value: `${metric.label} (${metric.value})`
      }))
    ],
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
