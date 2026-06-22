import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { writeAuthAuditLog } from "@/lib/auth/audit";
import { clearSessionPolicyCookies } from "@/lib/auth/session-policy";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  if (user) {
    try {
      await writeAuthAuditLog({
        event: "logout",
        actorId: user.id,
        email: user.email,
        result: "success"
      });
    } catch (auditError) {
      Sentry.captureException(auditError, {
        extra: {
          context: "audit_write_on_logout_success",
          actor_id: user.id
        }
      });
    }
  }

  const response = NextResponse.redirect(new URL("/auth/login", request.url), 303);
  clearSessionPolicyCookies(response);

  return response;
}
