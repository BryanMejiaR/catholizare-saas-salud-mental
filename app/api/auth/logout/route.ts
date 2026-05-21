import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { writeAuthAuditLog } from "@/lib/auth/audit";
import { getPublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const env = getPublicEnv();
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

  return NextResponse.redirect(new URL("/auth/login", env.NEXT_PUBLIC_APP_URL), 303);
}
