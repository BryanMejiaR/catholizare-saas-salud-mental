import "server-only";

import { headers } from "next/headers";

import { getTrustedClientIp } from "@/lib/audit/request-context";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AuthAuditEvent =
  | "login_success"
  | "login_failed"
  | "logout"
  | "password_reset_requested"
  | "password_changed";

type AuditParams = {
  event: AuthAuditEvent;
  actorId?: string | null;
  email?: string | null;
  result: "success" | "failure";
  metadata?: Record<string, string | number | boolean | null>;
};

export async function writeAuthAuditLog(params: AuditParams) {
  const headerStore = await headers();
  const ipAddress = getTrustedClientIp(headerStore);
  const userAgent = headerStore.get("user-agent");
  const supabaseAdmin = createSupabaseAdminClient();

  const { error } = await supabaseAdmin.from("auth_audit_logs").insert({
    actor_id: params.actorId ?? null,
    event: params.event,
    email: params.email ?? null,
    result: params.result,
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? null,
    metadata: params.metadata ?? {}
  });

  if (error) {
    throw new Error(`Unable to write auth audit log: ${error.message}`);
  }
}
