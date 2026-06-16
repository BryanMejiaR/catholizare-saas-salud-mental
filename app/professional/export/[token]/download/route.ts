import { createHash, randomUUID } from "crypto";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

import { safeWriteAuditLog } from "@/lib/audit/safe";
import { getTrustedClientIp } from "@/lib/audit/request-context";
import { getCurrentProfile } from "@/lib/auth/profile";
import { buildProfessionalExportPackage } from "@/lib/data-export/package";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type DownloadRouteProps = {
  params: Promise<{
    token: string;
  }>;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function GET(_request: NextRequest, { params }: DownloadRouteProps) {
  const [{ token }, profile, headerStore] = await Promise.all([
    params,
    getCurrentProfile(),
    headers()
  ]);

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    return NextResponse.redirect(new URL("/auth/login", _request.url));
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: exportRequest, error } = await supabaseAdmin
    .from("professional_export_requests")
    .select("id, folio, professional_id, status, token_expires_at, accepted_at")
    .eq("approval_token_hash", sha256(token))
    .single();

  if (
    error ||
    !exportRequest ||
    exportRequest.professional_id !== profile.id ||
    exportRequest.status !== "aprobada" ||
    !exportRequest.accepted_at ||
    !exportRequest.token_expires_at ||
    new Date(exportRequest.token_expires_at).getTime() <= Date.now()
  ) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "professional_export_download",
      entityType: "professional_export_requests",
      result: "denied",
      context: "audit_professional_export_download_denied"
    });

    return NextResponse.redirect(new URL(`/professional/export/${token}`, _request.url));
  }

  try {
    const sessionReference = randomUUID();
    const ipAddress = getTrustedClientIp(headerStore);
    const userAgent = headerStore.get("user-agent");
    const { data: claimedRequest, error: updateError } = await supabaseAdmin
      .from("professional_export_requests")
      .update({
        status: "descargada",
        downloaded_at: new Date().toISOString(),
        download_ip: ipAddress,
        download_user_agent: userAgent,
        download_session_reference: sessionReference
      })
      .eq("id", exportRequest.id)
      .eq("status", "aprobada")
      .select("id")
      .single();

    if (updateError || !claimedRequest) {
      await safeWriteAuditLog({
        userId: profile.id,
        role: profile.role,
        action: "professional_export_download",
        entityType: "professional_export_requests",
        entityId: exportRequest.id,
        result: "denied",
        context: "audit_professional_export_download_already_claimed"
      });

      return NextResponse.redirect(new URL(`/professional/export/${token}`, _request.url));
    }

    const zipPackage = await buildProfessionalExportPackage(profile.id, exportRequest.folio);

    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "professional_export_download",
      entityType: "professional_export_requests",
      entityId: exportRequest.id,
      result: "success",
      metadata: {
        folio: exportRequest.folio,
        package_hash: zipPackage.hash,
        session_reference: sessionReference
      },
      context: "audit_professional_export_download_success"
    });

    return new NextResponse(zipPackage.zip, {
      headers: {
        "content-type": "application/zip",
        "content-disposition": `attachment; filename="${zipPackage.fileName}"`,
        "x-catholizare-export-hash": zipPackage.hash
      }
    });
  } catch (downloadError) {
    Sentry.captureException(downloadError, {
      extra: {
        context: "professional_export_download",
        request_id: exportRequest.id,
        professional_id: profile.id
      }
    });

    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "professional_export_download",
      entityType: "professional_export_requests",
      entityId: exportRequest.id,
      result: "error",
      context: "audit_professional_export_download_error"
    });

    return NextResponse.redirect(new URL(`/professional/export/${token}`, _request.url));
  }
}
