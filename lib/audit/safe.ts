import "server-only";

import * as Sentry from "@sentry/nextjs";

import type { UserRole } from "@/lib/auth/types";
import { writeAuditLog } from "@/lib/audit/server";

type SafeAuditParams = {
  userId: string | null;
  role: UserRole | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  result: "success" | "denied" | "error";
  metadata?: Record<string, string | number | boolean | null>;
  context: string;
};

export async function safeWriteAuditLog({ context, ...params }: SafeAuditParams) {
  try {
    await writeAuditLog(params);
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        context,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId ?? null,
        result: params.result
      }
    });
  }
}
