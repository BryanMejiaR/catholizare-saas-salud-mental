import "server-only";

import { notFound } from "next/navigation";

import type { AuthProfile } from "@/lib/auth/types";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  Consentimiento,
  ExpedienteDetail,
  ExpedienteIdentificationData,
  ExpedienteSummary,
  HistoriaClinica,
  PatientLifeHistory
} from "@/lib/expedientes/types";

const EXPEDIENTE_SELECT =
  "id, patient_id, professional_id, identification_data, initial_consultation_reason, clinical_status, consent_status, status, session_notes_count, assessments_count, documents_count, last_clinical_activity_at, created_at, updated_at";

type ExpedienteRow = Omit<
  ExpedienteDetail,
  "patient" | "historia_clinica" | "consentimiento" | "life_history"
>;

async function getPatientsById(patientIds: string[]) {
  if (patientIds.length === 0) {
    return new Map<string, ExpedienteSummary["patient"]>();
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, account_status")
    .in("id", patientIds);

  if (error) {
    throw new Error(`Unable to load expediente patients: ${error.message}`);
  }

  return new Map(
    (data ?? []).map((patient) => [
      patient.id,
      {
        full_name: patient.full_name,
        email: patient.email,
        account_status: patient.account_status
      }
    ])
  );
}

export async function getExpedientesForProfessional(profile: AuthProfile) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("expedientes")
    .select(EXPEDIENTE_SELECT)
    .eq("professional_id", profile.id)
    .order("last_clinical_activity_at", { ascending: false });

  if (error) {
    throw new Error(`Unable to load expedientes: ${error.message}`);
  }

  const rows = (data ?? []) as ExpedienteRow[];
  const patients = await getPatientsById([...new Set(rows.map((row) => row.patient_id))]);

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "expediente_read",
    entityType: "expedientes",
    result: "success",
    metadata: {
      scope: "list",
      count: rows.length
    },
    context: "audit_expediente_list_read"
  });

  return rows.map((row) => ({
    id: row.id,
    patient_id: row.patient_id,
    professional_id: row.professional_id,
    initial_consultation_reason: row.initial_consultation_reason,
    consent_status: row.consent_status,
    status: row.status,
    last_clinical_activity_at: row.last_clinical_activity_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
    patient: patients.get(row.patient_id) ?? {
      full_name: "Paciente no disponible",
      email: "",
      account_status: "desconocido"
    }
  })) satisfies ExpedienteSummary[];
}

export async function getExpedienteDetail(profile: AuthProfile, expedienteId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("expedientes")
    .select(EXPEDIENTE_SELECT)
    .eq("id", expedienteId)
    .eq("professional_id", profile.id)
    .single();

  if (error || !data) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "expediente_read",
      entityType: "expedientes",
      entityId: expedienteId,
      result: "denied",
      context: "audit_expediente_detail_denied"
    });

    notFound();
  }

  const row = data as ExpedienteRow;
  const patients = await getPatientsById([row.patient_id]);
  const [{ data: historia }, { data: consentimiento }, { data: lifeHistory }] = await Promise.all([
    supabaseAdmin
      .from("historias_clinicas")
      .select("*")
      .eq("expediente_id", expedienteId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from("consentimientos")
      .select(
        "id, expediente_id, status, signed_at, modality, document_reference, document_storage_path, document_file_name, document_content_type, document_size_bytes"
      )
      .eq("expediente_id", expedienteId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from("patient_life_histories")
      .select("*")
      .eq("expediente_id", expedienteId)
      .maybeSingle()
  ]);

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "expediente_read",
    entityType: "expedientes",
    entityId: expedienteId,
    result: "success",
    metadata: {
      scope: "detail"
    },
    context: "audit_expediente_detail_read"
  });

  return {
    ...row,
    identification_data: (row.identification_data ?? {}) as ExpedienteIdentificationData,
    patient: patients.get(row.patient_id) ?? {
      full_name: "Paciente no disponible",
      email: "",
      account_status: "desconocido"
    },
    historia_clinica: (historia as HistoriaClinica | null) ?? null,
    consentimiento: (consentimiento as Consentimiento | null) ?? null,
    life_history: (lifeHistory as PatientLifeHistory | null) ?? null
  } satisfies ExpedienteDetail;
}
