"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/profile";
import { type UserRole, USER_ROLES } from "@/lib/auth/types";
import { updateAuthUserAccessMetadata } from "@/lib/auth/admin-metadata";
import { writeAuditLog } from "@/lib/audit/server";
import { getPublicEnv } from "@/lib/env";
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
  const env = getPublicEnv();

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
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/update-password`
    });

  const userId = invitedUser.user?.id;

  if (inviteError || !userId) {
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
    await supabaseAdmin.auth.admin.deleteUser(userId, true);
    return { message: "No fue posible configurar el usuario invitado.", ok: false };
  }

  try {
    await updateAuthUserAccessMetadata(userId, {
      role: target.role,
      accountStatus: "pendiente_activacion"
    });
  } catch {
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

    return { message: "No fue posible crear el perfil del usuario.", ok: false };
  }

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
    .select("id, role, email")
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
    return { message: "No fue posible actualizar el estado.", ok: false };
  }

  await updateAuthUserAccessMetadata(parsed.data.userId, {
    role: targetRole,
    accountStatus: parsed.data.accountStatus
  });

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

  revalidatePath("/admin/users");
  revalidatePath("/super-admin/users");

  return { message: "Estado actualizado.", ok: true };
}
