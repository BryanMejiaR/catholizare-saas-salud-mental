"use server";

import { createHash, randomBytes, randomUUID } from "crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { safeWriteAuditLog } from "@/lib/audit/safe";
import { getTrustedClientIp } from "@/lib/audit/request-context";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getServerEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ExportActionState = {
  message?: string;
  ok?: boolean;
  link?: string;
};

const requestSchema = z.object({
  reason: z.string().trim().min(10).max(2000)
});

const reviewSchema = z.object({
  requestId: z.string().uuid(),
  decision: z.enum(["approve", "reject"]),
  rejectionReason: z.string().trim().max(1200).optional()
});

const acceptSchema = z.object({
  token: z.string().trim().min(32),
  fullName: z.string().trim().min(3).max(180),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(7).max(40),
  rfc: z.string().trim().min(10).max(20),
  responsibilityAccepted: z.literal("on")
});

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function createFolio(prefix: string) {
  return `${prefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}

async function getRequestContext() {
  const headerStore = await headers();

  return {
    ipAddress: getTrustedClientIp(headerStore),
    userAgent: headerStore.get("user-agent")
  };
}

export async function requestProfessionalExportAction(
  _previousState: ExportActionState,
  formData: FormData
): Promise<ExportActionState> {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = requestSchema.safeParse({
    reason: formData.get("reason")
  });

  if (!parsed.success) {
    return { message: "Describe el motivo de la solicitud.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabaseAdmin
    .from("professional_export_requests")
    .select("id")
    .eq("professional_id", profile.id)
    .in("status", ["solicitada", "aprobada"])
    .limit(1);

  if (existingError) {
    Sentry.captureException(existingError, {
      extra: { context: "professional_export_existing_check", professional_id: profile.id }
    });
    return { message: "No fue posible validar solicitudes existentes.", ok: false };
  }

  if ((existing ?? []).length > 0) {
    return { message: "Ya tienes una solicitud pendiente o aprobada.", ok: false };
  }

  const folio = createFolio("EXP");
  const { data, error } = await supabaseAdmin
    .from("professional_export_requests")
    .insert({
      folio,
      professional_id: profile.id,
      reason: parsed.data.reason
    })
    .select("id")
    .single();

  if (error || !data) {
    Sentry.captureException(error ?? new Error("Export request insert did not return id"), {
      extra: { context: "professional_export_request_create", professional_id: profile.id }
    });
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "professional_export_request_create",
      entityType: "professional_export_requests",
      result: "error",
      context: "audit_professional_export_request_create_error"
    });

    return { message: "No fue posible crear la solicitud.", ok: false };
  }

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "professional_export_request_create",
    entityType: "professional_export_requests",
    entityId: data.id,
    result: "success",
    metadata: { folio },
    context: "audit_professional_export_request_create_success"
  });

  revalidatePath("/professional/export");

  return { message: `Solicitud creada con folio ${folio}.`, ok: true };
}

export async function reviewProfessionalExportRequestAction(
  _previousState: ExportActionState,
  formData: FormData
): Promise<ExportActionState> {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "super_administrador" || profile.account_status !== "activo") {
    return { message: "No tienes permisos de Super Administrador.", ok: false };
  }

  const parsed = reviewSchema.safeParse({
    requestId: formData.get("requestId"),
    decision: formData.get("decision"),
    rejectionReason: `${formData.get("rejectionReason") ?? ""}` || undefined
  });

  if (!parsed.success) {
    return { message: "Decision invalida.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: request, error: loadError } = await supabaseAdmin
    .from("professional_export_requests")
    .select("id, status")
    .eq("id", parsed.data.requestId)
    .single();

  if (loadError || !request || request.status !== "solicitada") {
    return { message: "La solicitud no esta disponible para revision.", ok: false };
  }

  if (parsed.data.decision === "reject") {
    const { error } = await supabaseAdmin
      .from("professional_export_requests")
      .update({
        status: "rechazada",
        rejected_by: profile.id,
        rejected_at: new Date().toISOString(),
        rejection_reason: parsed.data.rejectionReason || "Rechazada por Super Administrador."
      })
      .eq("id", request.id)
      .eq("status", "solicitada");

    if (error) {
      Sentry.captureException(error, {
        extra: { context: "professional_export_request_reject", request_id: request.id }
      });
      return { message: "No fue posible rechazar la solicitud.", ok: false };
    }

    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "professional_export_request_reject",
      entityType: "professional_export_requests",
      entityId: request.id,
      result: "success",
      context: "audit_professional_export_request_reject_success"
    });

    revalidatePath("/super-admin/exports");
    return { message: "Solicitud rechazada.", ok: true };
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
  const { error } = await supabaseAdmin
    .from("professional_export_requests")
    .update({
      status: "aprobada",
      approved_by: profile.id,
      approved_at: new Date().toISOString(),
      approval_token_hash: tokenHash,
      token_expires_at: expiresAt,
      mfa_code_required: false,
      mfa_provider: "pendiente"
    })
    .eq("id", request.id)
    .eq("status", "solicitada");

  if (error) {
    Sentry.captureException(error, {
      extra: { context: "professional_export_request_approve", request_id: request.id }
    });
    return { message: "No fue posible aprobar la solicitud.", ok: false };
  }

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "professional_export_request_approve",
    entityType: "professional_export_requests",
    entityId: request.id,
    result: "success",
    metadata: { token_expires_at: expiresAt },
    context: "audit_professional_export_request_approve_success"
  });

  revalidatePath("/super-admin/exports");

  return {
    message: "Solicitud aprobada. Copia este link; solo se muestra una vez.",
    ok: true,
    link: `${getServerEnv().NEXT_PUBLIC_APP_URL}/professional/export/${token}`
  };
}

export async function acceptProfessionalExportResponsibilityAction(
  _previousState: ExportActionState,
  formData: FormData
): Promise<ExportActionState> {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = acceptSchema.safeParse({
    token: formData.get("token"),
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    rfc: formData.get("rfc"),
    responsibilityAccepted: formData.get("responsibilityAccepted")
  });

  if (!parsed.success) {
    return { message: "Completa y acepta la responsabilidad de descarga.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const tokenHash = sha256(parsed.data.token);
  const { data: request, error: loadError } = await supabaseAdmin
    .from("professional_export_requests")
    .select("id, folio, professional_id, status, token_expires_at")
    .eq("approval_token_hash", tokenHash)
    .single();

  if (
    loadError ||
    !request ||
    request.professional_id !== profile.id ||
    request.status !== "aprobada" ||
    !request.token_expires_at ||
    new Date(request.token_expires_at).getTime() <= Date.now()
  ) {
    await safeWriteAuditLog({
      userId: profile.id,
      role: profile.role,
      action: "professional_export_acceptance",
      entityType: "professional_export_requests",
      result: "denied",
      context: "audit_professional_export_acceptance_denied"
    });

    return { message: "El link no es valido o ya expiro.", ok: false };
  }

  const acceptedAt = new Date().toISOString();
  const acceptanceFolio = createFolio("ACEPT");
  const sessionReference = randomUUID();
  const acceptanceDocument = JSON.stringify({
    folio: request.folio,
    acceptance_folio: acceptanceFolio,
    accepted_at: acceptedAt,
    professional_id: profile.id,
    full_name: parsed.data.fullName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    rfc: parsed.data.rfc,
    method: "checkbox_firmar_aceptar_mvp_sin_codigo_6_digitos",
    session_reference: sessionReference
  });
  const { ipAddress, userAgent } = await getRequestContext();

  const { error } = await supabaseAdmin
    .from("professional_export_requests")
    .update({
      acceptance_folio: acceptanceFolio,
      accepted_at: acceptedAt,
      acceptance_full_name: parsed.data.fullName,
      acceptance_email: parsed.data.email,
      acceptance_phone: parsed.data.phone,
      acceptance_rfc: parsed.data.rfc,
      acceptance_ip: ipAddress,
      acceptance_user_agent: userAgent,
      acceptance_method: "Checkbox + boton Firmar y aceptar; codigo de 6 digitos pendiente MVP",
      acceptance_document_hash: sha256(acceptanceDocument),
      acceptance_session_reference: sessionReference
    })
    .eq("id", request.id)
    .eq("status", "aprobada");

  if (error) {
    Sentry.captureException(error, {
      extra: { context: "professional_export_acceptance", request_id: request.id }
    });
    return { message: "No fue posible registrar la aceptacion.", ok: false };
  }

  await safeWriteAuditLog({
    userId: profile.id,
    role: profile.role,
    action: "professional_export_acceptance",
    entityType: "professional_export_requests",
    entityId: request.id,
    result: "success",
    metadata: {
      acceptance_folio: acceptanceFolio,
      session_reference: sessionReference
    },
    context: "audit_professional_export_acceptance_success"
  });

  revalidatePath(`/professional/export/${parsed.data.token}`);

  return { message: `Aceptacion registrada con folio ${acceptanceFolio}.`, ok: true };
}
