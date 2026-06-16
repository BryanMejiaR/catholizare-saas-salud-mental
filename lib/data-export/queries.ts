import "server-only";

import type { AuthProfile } from "@/lib/auth/types";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ProfessionalExportRequest,
  SuperAdminExportRequest
} from "@/lib/data-export/types";

const EXPORT_REQUEST_SELECT =
  "id, folio, professional_id, status, reason, requested_at, approved_at, rejected_at, rejection_reason, token_expires_at, acceptance_folio, accepted_at, downloaded_at, created_at";

export async function getProfessionalExportRequests(profile: AuthProfile) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("professional_export_requests")
    .select(EXPORT_REQUEST_SELECT)
    .eq("professional_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "professional_export_request_read",
      entityType: "professional_export_requests",
      result: "error",
      context: "audit_professional_export_request_read_error"
    });
    throw new Error(`Unable to load export requests: ${error.message}`);
  }

  return (data ?? []) as ProfessionalExportRequest[];
}

export async function getSuperAdminExportRequests(profile: AuthProfile) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("professional_export_requests")
    .select(EXPORT_REQUEST_SELECT)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "professional_export_request_admin_read",
      entityType: "professional_export_requests",
      result: "error",
      context: "audit_professional_export_request_admin_read_error"
    });
    throw new Error(`Unable to load export requests: ${error.message}`);
  }

  const requests = (data ?? []) as ProfessionalExportRequest[];
  const professionals = await getProfessionalsById([
    ...new Set(requests.map((request) => request.professional_id))
  ]);

  return requests.map((request) => ({
    ...request,
    professional: professionals.get(request.professional_id) ?? {
      full_name: "Profesional no disponible",
      email: ""
    }
  })) satisfies SuperAdminExportRequest[];
}

async function getProfessionalsById(ids: string[]) {
  if (ids.length === 0) {
    return new Map<string, SuperAdminExportRequest["professional"]>();
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email")
    .in("id", ids);

  if (error) {
    throw new Error(`Unable to load professionals: ${error.message}`);
  }

  return new Map(
    (data ?? []).map((profile) => [
      profile.id as string,
      {
        full_name: profile.full_name as string,
        email: profile.email as string
      }
    ])
  );
}
