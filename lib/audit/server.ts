import "server-only";

import { headers } from "next/headers";

import type { UserRole } from "@/lib/auth/types";
import { getTrustedClientIp } from "@/lib/audit/request-context";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AuditResult = "success" | "denied" | "error";

type AuditLogParams = {
  userId: string | null;
  role: UserRole | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  result: AuditResult;
  metadata?: Record<string, string | number | boolean | null>;
};

export async function writeAuditLog(params: AuditLogParams) {
  const headerStore = await headers();
  const ipAddress = getTrustedClientIp(headerStore);
  const userAgent = headerStore.get("user-agent");
  const supabaseAdmin = createSupabaseAdminClient();

  const { error } = await supabaseAdmin.from("audit_logs").insert({
    user_id: params.userId,
    role: params.role,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    result: params.result,
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? null,
    metadata: params.metadata ?? {}
  });

  if (error) {
    throw new Error(`Unable to write audit log: ${error.message}`);
  }
}
