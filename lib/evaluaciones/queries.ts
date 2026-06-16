import "server-only";

import type { AuthProfile } from "@/lib/auth/types";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PatientAssessmentUpload, PsychologicalAssessment } from "@/lib/evaluaciones/types";

const ASSESSMENT_SELECT =
  "id, expediente_id, patient_id, professional_id, linked_tcc_process_id, linked_reevaluation_cut_id, assessment_name, assessment_type, assessment_purpose, applied_at, input_method, raw_scores, scaled_scores, percentiles, cutoff_points, interpretation, limitations, implications, ai_draft_interpretation, comparison_notes, professional_validation_status, validated_by_user_id, validated_at, status, ai_session_id, annulment_reason, annulled_at, annulled_by_user_id, created_by, created_at, updated_at";

export async function getAssessmentsForExpediente(profile: AuthProfile, expedienteId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("psychological_assessments")
    .select(ASSESSMENT_SELECT)
    .eq("expediente_id", expedienteId)
    .eq("professional_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "assessment_read",
      entityType: "psychological_assessments",
      entityId: expedienteId,
      result: "error",
      context: "audit_assessment_list_error"
    });

    throw new Error(`Unable to load psychological assessments: ${error.message}`);
  }

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "assessment_read",
    entityType: "psychological_assessments",
    entityId: expedienteId,
    result: "success",
    metadata: {
      scope: "expediente_list",
      count: data?.length ?? 0
    },
    context: "audit_assessment_list_success"
  });

  return (data ?? []) as PsychologicalAssessment[];
}

export async function getAssessmentUploadsForExpediente(
  profile: AuthProfile,
  expedienteId: string
) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("patient_assessment_uploads")
    .select(
      "id, expediente_id, patient_id, professional_id, assessment_code, assessment_label, file_storage_path, file_name, file_content_type, file_size_bytes, status, extracted_results, professional_notes, ai_session_id, created_at, updated_at"
    )
    .eq("expediente_id", expedienteId)
    .eq("professional_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "assessment_upload_read",
      entityType: "patient_assessment_uploads",
      entityId: expedienteId,
      result: "error",
      context: "audit_assessment_upload_list_error"
    });

    throw new Error(`Unable to load patient assessment uploads: ${error.message}`);
  }

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "assessment_upload_read",
    entityType: "patient_assessment_uploads",
    entityId: expedienteId,
    result: "success",
    metadata: {
      scope: "expediente_list",
      count: data?.length ?? 0
    },
    context: "audit_assessment_upload_list_success"
  });

  return (data ?? []) as PatientAssessmentUpload[];
}
