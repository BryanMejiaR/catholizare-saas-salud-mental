"use server";

import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/profile";
import { type UserRole, USER_ROLES } from "@/lib/auth/types";
import { updateAuthUserAccessMetadata } from "@/lib/auth/admin-metadata";
import { writeAuditLog } from "@/lib/audit/server";
import { sendEmail } from "@/lib/email/resend";
import { getPublicAppUrl } from "@/lib/integrations/public-url";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { canCreateRole, canManageProfile, MANAGEABLE_ACCOUNT_STATUSES } from "@/lib/users/types";

type UsersActionState = {
  message?: string;
  ok?: boolean;
};

const createUserSchema = z.object({
  fullName: z.string().trim().min(2, "Escribe el nombre completo."),
  email: z.string().trim().email("Escribe un correo válido.").transform((value) => value.toLowerCase()),
  role: z.enum(USER_ROLES),
  primaryProfessionalId: z.string().uuid().optional().or(z.literal(""))
});

const statusSchema = z.object({
  userId: z.string().uuid(),
  accountStatus: z.enum(MANAGEABLE_ACCOUNT_STATUSES)
});
const userIdSchema = z.object({
  userId: z.string().uuid()
});

function authRedirectPath() {
  return new URL("/auth/callback?next=/auth/update-password", getPublicAppUrl()).toString();
}

function adminUsersPath(role: UserRole) {
  return role === "super_administrador" ? "/super-admin/users" : "/admin/users";
}

async function sendAuthActionEmail({
  email,
  fullName,
  actionLink,
  subject,
  intro
}: {
  email: string;
  fullName: string;
  actionLink: string;
  subject: string;
  intro: string;
}) {
  return sendEmail({
    to: email,
    subject,
    html: `<p>Hola ${fullName},</p><p>${intro}</p><p><a href="${actionLink}">Continuar en Catholizare OS</a></p><p>Si no solicitaste este correo, ignora este mensaje.</p>`,
    text: `Hola ${fullName},\n\n${intro}\n\nContinuar en Catholizare OS: ${actionLink}\n\nSi no solicitaste este correo, ignora este mensaje.`
  });
}

async function findProfessionalOrFail(professionalId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, role, account_status")
    .eq("id", professionalId)
    .eq("role", "profesional")
    .single();

  if (error || !data || data.account_status !== "activo") {
    throw new Error("El Profesional asignado no existe o no está activo.");
  }
}

export async function createManagedUserAction(
  _previousState: UsersActionState,
  formData: FormData
): Promise<UsersActionState> {
  const actor = await getCurrentProfile();

  if (!actor || actor.account_status !== "activo") {
    return { message: "No tienes una sesión activa válida.", ok: false };
  }

  const parsed = createUserSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    role: formData.get("role"),
    primaryProfessionalId: formData.get("primaryProfessionalId") ?? ""
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos inválidos.", ok: false };
  }

  const target = parsed.data;

  if (!canCreateRole(actor.role, target.role)) {
    await writeAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "user_create",
      entityType: "profiles",
      result: "denied",
      metadata: {
        target_role: target.role
      }
    });

    return { message: "No tienes permiso para crear ese tipo de usuario.", ok: false };
  }

  let primaryProfessionalId: string | null = null;
  let assignedProfessionalIds: string[] = [];

  if (target.role === "paciente") {
    primaryProfessionalId =
      actor.role === "profesional" ? actor.id : target.primaryProfessionalId || null;

    if (!primaryProfessionalId) {
      return { message: "Selecciona el Profesional principal del Paciente.", ok: false };
    }

    try {
      await findProfessionalOrFail(primaryProfessionalId);
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : "Profesional inválido.",
        ok: false
      };
    }

    assignedProfessionalIds = [primaryProfessionalId];
  }

  const supabaseAdmin = createSupabaseAdminClient();

  const existingProfile = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("email", target.email)
    .maybeSingle();

  if (existingProfile.data) {
    return { message: "Ya existe un usuario con ese correo.", ok: false };
  }

  const { data: invitedUser, error: inviteError } =
    await supabaseAdmin.auth.admin.inviteUserByEmail(target.email, {
      data: {
        full_name: target.fullName
      },
      redirectTo: authRedirectPath()
    });

  const userId = invitedUser.user?.id;

  if (inviteError || !userId) {
    Sentry.captureException(inviteError ?? new Error("Invite user did not return an id"), {
      extra: {
        target_email: target.email,
        target_role: target.role
      }
    });

    await writeAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "user_create",
      entityType: "profiles",
      result: "error",
      metadata: {
        target_email: target.email,
        target_role: target.role
      }
    });

    return { message: "No fue posible enviar la invitación.", ok: false };
  }

  const { error: userMetadataError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      full_name: target.fullName
    }
  });

  if (userMetadataError) {
    Sentry.captureException(userMetadataError, {
      extra: {
        target_email: target.email,
        target_role: target.role
      }
    });

    await supabaseAdmin.auth.admin.deleteUser(userId, true);
    return { message: "No fue posible configurar el usuario invitado.", ok: false };
  }

  try {
    await updateAuthUserAccessMetadata(userId, {
      role: target.role,
      accountStatus: "pendiente_activacion"
    });
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        target_email: target.email,
        target_role: target.role
      }
    });

    await supabaseAdmin.auth.admin.deleteUser(userId, true);
    return { message: "No fue posible configurar el rol del usuario.", ok: false };
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").insert({
    id: userId,
    role: target.role,
    account_status: "pendiente_activacion",
    full_name: target.fullName,
    email: target.email,
    primary_professional_id: primaryProfessionalId,
    assigned_professional_ids: assignedProfessionalIds,
    created_by: actor.id
  });

  if (profileError) {
    Sentry.captureException(profileError, {
      extra: {
        target_email: target.email,
        target_role: target.role
      }
    });

    await supabaseAdmin.auth.admin.deleteUser(userId, true);
    await writeAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "user_create",
      entityType: "profiles",
      entityId: userId,
      result: "error",
      metadata: {
        target_email: target.email,
        target_role: target.role
      }
    });

    return {
      message:
        profileError.code === "23505"
          ? "Ya existe un usuario con ese correo."
          : "No fue posible crear el perfil del usuario.",
      ok: false
    };
  }

  try {
    await writeAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "user_create",
      entityType: "profiles",
      entityId: userId,
      result: "success",
      metadata: {
        target_email: target.email,
        target_role: target.role
      }
    });
  } catch (auditError) {
    Sentry.captureException(auditError, {
      extra: {
        context: "audit_write_on_user_create_success",
        target_email: target.email,
        target_role: target.role
      }
    });
  }

  revalidatePath("/admin/users");
  revalidatePath("/professional/patients");
  revalidatePath("/super-admin/users");

  return { message: "Invitación enviada y perfil creado.", ok: true };
}

export async function setUserStatusAction(
  _previousState: UsersActionState,
  formData: FormData
): Promise<UsersActionState> {
  const actor = await getCurrentProfile();

  if (!actor || actor.account_status !== "activo") {
    return { message: "No tienes una sesión activa válida.", ok: false };
  }

  const parsed = statusSchema.safeParse({
    userId: formData.get("userId"),
    accountStatus: formData.get("accountStatus")
  });

  if (!parsed.success) {
    return { message: "Datos inválidos.", ok: false };
  }

  if (parsed.data.userId === actor.id) {
    return { message: "No puedes cambiar el estado de tu propia cuenta.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: targetProfile, error: targetError } = await supabaseAdmin
    .from("profiles")
    .select("id, role, email, account_status")
    .eq("id", parsed.data.userId)
    .single();

  if (targetError || !targetProfile) {
    return { message: "Usuario no encontrado.", ok: false };
  }

  const targetRole = targetProfile.role as UserRole;

  if (!canManageProfile(actor.role, targetRole)) {
    await writeAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "user_status_update",
      entityType: "profiles",
      entityId: parsed.data.userId,
      result: "denied",
      metadata: {
        target_role: targetRole,
        next_status: parsed.data.accountStatus
      }
    });

    return { message: "No tienes permiso para cambiar ese usuario.", ok: false };
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      account_status: parsed.data.accountStatus
    })
    .eq("id", parsed.data.userId);

  if (profileError) {
    Sentry.captureException(profileError, {
      extra: {
        target_user_id: parsed.data.userId,
        target_role: targetRole,
        next_status: parsed.data.accountStatus
      }
    });

    await writeAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "user_status_update",
      entityType: "profiles",
      entityId: parsed.data.userId,
      result: "error",
      metadata: {
        target_role: targetRole,
        next_status: parsed.data.accountStatus
      }
    });

    return { message: "No fue posible actualizar el estado.", ok: false };
  }

  try {
    await updateAuthUserAccessMetadata(parsed.data.userId, {
      role: targetRole,
      accountStatus: parsed.data.accountStatus
    });
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        target_user_id: parsed.data.userId,
        target_role: targetRole,
        previous_status: targetProfile.account_status,
        next_status: parsed.data.accountStatus
      }
    });

    const { error: rollbackError } = await supabaseAdmin
      .from("profiles")
      .update({
        account_status: targetProfile.account_status
      })
      .eq("id", parsed.data.userId);

    if (rollbackError) {
      Sentry.captureException(rollbackError, {
        extra: {
          target_user_id: parsed.data.userId,
          target_role: targetRole,
          intended_status: parsed.data.accountStatus,
          rollback_status: targetProfile.account_status
        }
      });
    }

    try {
      await writeAuditLog({
        userId: actor.id,
        role: actor.role,
        action: "user_status_update",
        entityType: "profiles",
        entityId: parsed.data.userId,
        result: "error",
        metadata: {
          target_role: targetRole,
          next_status: parsed.data.accountStatus,
          rollback_success: !rollbackError,
          state: rollbackError ? "diverged_db_jwt" : "rolled_back"
        }
      });
    } catch (auditError) {
      Sentry.captureException(auditError, {
        extra: {
          context: "audit_write_in_status_rollback",
          target_user_id: parsed.data.userId,
          target_role: targetRole,
          rollback_success: !rollbackError
        }
      });
    }

    return { message: "No fue posible sincronizar el estado del usuario.", ok: false };
  }

  try {
    await writeAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "user_status_update",
      entityType: "profiles",
      entityId: parsed.data.userId,
      result: "success",
      metadata: {
        target_role: targetRole,
        next_status: parsed.data.accountStatus
      }
    });
  } catch (auditError) {
    Sentry.captureException(auditError, {
      extra: {
        context: "audit_write_on_user_status_success",
        target_user_id: parsed.data.userId,
        target_role: targetRole,
        next_status: parsed.data.accountStatus
      }
    });
  }

  revalidatePath("/admin/users");
  revalidatePath("/super-admin/users");

  return { message: "Estado actualizado.", ok: true };
}

async function loadManagedTarget(actorRole: UserRole, userId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, role, email, full_name, account_status")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { supabaseAdmin, target: null };
  }

  const target = data as {
    id: string;
    role: UserRole;
    email: string;
    full_name: string;
    account_status: string;
  };

  if (!canManageProfile(actorRole, target.role)) {
    return { supabaseAdmin, target: null };
  }

  return { supabaseAdmin, target };
}

export async function resendActivationEmailAction(
  _previousState: UsersActionState,
  formData: FormData
): Promise<UsersActionState> {
  const actor = await getCurrentProfile();

  if (!actor || actor.account_status !== "activo") {
    return { message: "No tienes una sesión activa válida.", ok: false };
  }

  const parsed = userIdSchema.safeParse({ userId: formData.get("userId") });

  if (!parsed.success || parsed.data.userId === actor.id) {
    return { message: "Usuario inválido.", ok: false };
  }

  const { supabaseAdmin, target } = await loadManagedTarget(actor.role, parsed.data.userId);

  if (!target) {
    return { message: "Usuario no encontrado o sin permiso.", ok: false };
  }

  if (target.account_status !== "pendiente_activacion") {
    return { message: "Solo se puede reenviar a usuarios pendientes de activación.", ok: false };
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "invite",
    email: target.email,
    options: {
      redirectTo: authRedirectPath()
    }
  });
  const actionLink = data.properties?.action_link;

  if (error || !actionLink) {
    Sentry.captureException(error ?? new Error("Invite link did not return action_link"), {
      extra: { target_user_id: target.id }
    });
    return { message: "No fue posible generar el enlace de activación.", ok: false };
  }

  const emailResult = await sendAuthActionEmail({
    email: target.email,
    fullName: target.full_name,
    actionLink,
    subject: "Activa tu cuenta en Catholizare OS",
    intro: "Se generó un nuevo enlace para activar tu cuenta y crear tu contraseña."
  });

  if (!emailResult.ok) {
    Sentry.captureMessage("activation_email_resend_failed", {
      level: "warning",
      extra: {
        target_user_id: target.id,
        target_role: target.role,
        error_code: emailResult.code,
        response_status: emailResult.status,
        error: emailResult.error
      }
    });
    await writeAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "user_activation_email_resend",
      entityType: "profiles",
      entityId: target.id,
      result: "error",
      metadata: {
        target_role: target.role,
        failure_step: "send_email",
        error_code: emailResult.code,
        response_status: emailResult.status ?? null
      }
    });
    return { message: emailResult.error, ok: false };
  }

  await writeAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "user_activation_email_resend",
    entityType: "profiles",
    entityId: target.id,
    result: "success",
    metadata: { target_role: target.role }
  });

  revalidatePath(adminUsersPath(actor.role));
  return { message: "Correo de activación reenviado.", ok: true };
}

export async function sendPasswordChangeEmailAction(
  _previousState: UsersActionState,
  formData: FormData
): Promise<UsersActionState> {
  const actor = await getCurrentProfile();

  if (!actor || actor.account_status !== "activo") {
    return { message: "No tienes una sesión activa válida.", ok: false };
  }

  const parsed = userIdSchema.safeParse({ userId: formData.get("userId") });

  if (!parsed.success || parsed.data.userId === actor.id) {
    return { message: "Usuario inválido.", ok: false };
  }

  const { supabaseAdmin, target } = await loadManagedTarget(actor.role, parsed.data.userId);

  if (!target) {
    return { message: "Usuario no encontrado o sin permiso.", ok: false };
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "recovery",
    email: target.email,
    options: {
      redirectTo: new URL("/auth/callback?next=/auth/reset-password", getPublicAppUrl()).toString()
    }
  });
  const actionLink = data.properties?.action_link;

  if (error || !actionLink) {
    Sentry.captureException(error ?? new Error("Recovery link did not return action_link"), {
      extra: { target_user_id: target.id }
    });
    await writeAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "user_password_change_email",
      entityType: "profiles",
      entityId: target.id,
      result: "error",
      metadata: {
        target_role: target.role,
        failure_step: "generate_link"
      }
    });
    return { message: "No fue posible generar el enlace de cambio de contraseña.", ok: false };
  }

  const emailResult = await sendAuthActionEmail({
    email: target.email,
    fullName: target.full_name,
    actionLink,
    subject: "Cambio de contraseña en Catholizare OS",
    intro: "Se generó un enlace seguro para cambiar tu contraseña."
  });

  if (!emailResult.ok) {
    Sentry.captureMessage("password_change_email_failed", {
      level: "warning",
      extra: {
        target_user_id: target.id,
        target_role: target.role,
        error_code: emailResult.code,
        response_status: emailResult.status,
        error: emailResult.error
      }
    });
    await writeAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "user_password_change_email",
      entityType: "profiles",
      entityId: target.id,
      result: "error",
      metadata: {
        target_role: target.role,
        failure_step: "send_email",
        error_code: emailResult.code,
        response_status: emailResult.status ?? null
      }
    });
    return { message: emailResult.error, ok: false };
  }

  await writeAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "user_password_change_email",
    entityType: "profiles",
    entityId: target.id,
    result: "success",
    metadata: { target_role: target.role }
  });

  return { message: "Correo de cambio de contraseña enviado.", ok: true };
}

export async function deletePendingActivationUserAction(
  _previousState: UsersActionState,
  formData: FormData
): Promise<UsersActionState> {
  const actor = await getCurrentProfile();

  if (!actor || actor.account_status !== "activo") {
    return { message: "No tienes una sesión activa válida.", ok: false };
  }

  const parsed = userIdSchema.safeParse({ userId: formData.get("userId") });

  if (!parsed.success || parsed.data.userId === actor.id) {
    return { message: "Usuario inválido.", ok: false };
  }

  const { supabaseAdmin, target } = await loadManagedTarget(actor.role, parsed.data.userId);

  if (!target) {
    return { message: "Usuario no encontrado o sin permiso.", ok: false };
  }

  if (target.account_status !== "pendiente_activacion") {
    return { message: "Solo se pueden eliminar usuarios pendientes de activación.", ok: false };
  }

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(target.id, false);

  if (authError) {
    Sentry.captureException(authError, { extra: { target_user_id: target.id } });
    return { message: "No fue posible eliminar el usuario pendiente en Auth.", ok: false };
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", target.id)
    .eq("account_status", "pendiente_activacion");

  if (profileError) {
    Sentry.captureException(profileError, { extra: { target_user_id: target.id } });
    return { message: "No fue posible eliminar el perfil pendiente.", ok: false };
  }

  await writeAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "user_pending_activation_delete",
    entityType: "profiles",
    entityId: target.id,
    result: "success",
    metadata: { target_role: target.role, target_email: target.email }
  });

  revalidatePath(adminUsersPath(actor.role));
  return { message: "Usuario pendiente eliminado.", ok: true };
}
