"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

import {
  getExpiredInviteActivationCookieOptions,
  INVITE_ACTIVATION_COOKIE_NAME,
  verifyInviteActivationToken
} from "@/lib/auth/invite-activation-token";
import { ROLE_HOME_PATH, type AuthProfile } from "@/lib/auth/types";
import { updateAuthUserAccessMetadata } from "@/lib/auth/admin-metadata";
import { PASSWORD_POLICY_MESSAGE, isValidPassword } from "@/lib/auth/password";
import { writeAuthAuditLog } from "@/lib/auth/audit";
import { getPublicEnv } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AuthActionState = {
  message?: string;
};

const GENERIC_LOGIN_ERROR = "No fue posible iniciar sesión con esas credenciales.";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function findProfileByEmail(email: string): Promise<AuthProfile | null> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, role, account_status, full_name, email, last_login_at, failed_attempts, locked_until"
    )
    .eq("email", email)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as AuthProfile;
}

async function findProfileById(userId: string): Promise<AuthProfile | null> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, role, account_status, full_name, email, last_login_at, failed_attempts, locked_until"
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as AuthProfile;
}

async function recordFailedAttempt(profile: AuthProfile | null, email: string) {
  const supabaseAdmin = createSupabaseAdminClient();

  if (profile) {
    const failedAttempts = profile.failed_attempts + 1;
    const lockedUntil =
      failedAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;

    await supabaseAdmin
      .from("profiles")
      .update({
        failed_attempts: failedAttempts,
        account_status: lockedUntil ? "bloqueado" : profile.account_status,
        locked_until: lockedUntil
      })
      .eq("id", profile.id);
  }

  await writeAuthAuditLog({
    event: "login_failed",
    actorId: profile?.id ?? null,
    email,
    result: "failure",
    metadata: {
      reason: "invalid_credentials_or_locked"
    }
  });
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formValue(formData, "email").toLowerCase();
  const password = formValue(formData, "password");

  if (!email || !password) {
    return { message: "Escribe tu correo y contraseña." };
  }

  const profile = await findProfileByEmail(email);
  const now = new Date();

  if (
    profile?.account_status === "inactivo" ||
    (profile?.locked_until && new Date(profile.locked_until) > now)
  ) {
    await recordFailedAttempt(profile, email);
    return { message: GENERIC_LOGIN_ERROR };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error
  } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !user) {
    await recordFailedAttempt(profile, email);
    return { message: GENERIC_LOGIN_ERROR };
  }

  const authProfile = profile?.id === user.id ? profile : await findProfileById(user.id);

  if (!authProfile) {
    await supabase.auth.signOut();
    await writeAuthAuditLog({
      event: "login_failed",
      actorId: user.id,
      email,
      result: "failure",
      metadata: {
        reason: "missing_profile"
      }
    });

    return {
      message: "Tu cuenta existe en autenticacion, pero no tiene perfil de Catholizare asignado."
    };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  await supabaseAdmin
    .from("profiles")
    .update({
      account_status: "activo",
      failed_attempts: 0,
      locked_until: null,
      last_login_at: now.toISOString()
    })
    .eq("id", authProfile.id);

  await writeAuthAuditLog({
    event: "login_success",
    actorId: authProfile.id,
    email,
    result: "success"
  });

  redirect(ROLE_HOME_PATH[authProfile.role]);
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formValue(formData, "email").toLowerCase();

  if (!email) {
    return { message: "Escribe tu correo electrónico." };
  }

  const supabase = await createSupabaseServerClient();
  const env = getPublicEnv();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/update-password`
  });

  await writeAuthAuditLog({
    event: "password_reset_requested",
    email,
    result: "success"
  });

  return {
    message: "Si el correo existe en Catholizare, recibirá un enlace de recuperación."
  };
}

async function completePendingInviteActivation(
  userId: string,
  password: string
): Promise<AuthActionState> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, role, account_status, email")
    .eq("id", userId)
    .single();

  if (profileError || !profile || profile.account_status !== "pendiente_activacion") {
    console.warn("[auth_update_password] invite activation rejected by profile state", {
      hasProfile: Boolean(profile),
      profileError: profileError?.message,
      status: profile?.account_status
    });
    return { message: "El enlace expirÃ³ o la sesiÃ³n no estÃ¡ activa." };
  }

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password
  });

  if (authError) {
    Sentry.captureException(authError, {
      extra: {
        context: "invite_activation_admin_password_update",
        userId
      }
    });

    return { message: "No fue posible actualizar la contraseÃ±a." };
  }

  await supabaseAdmin
    .from("profiles")
    .update({
      account_status: "activo",
      failed_attempts: 0,
      locked_until: null
    })
    .eq("id", userId);

  await updateAuthUserAccessMetadata(userId, {
    role: profile.role,
    accountStatus: "activo"
  });

  await writeAuthAuditLog({
    event: "password_changed",
    actorId: userId,
    email: profile.email,
    result: "success",
    metadata: {
      activation_method: "signed_invite_cookie"
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(
    INVITE_ACTIVATION_COOKIE_NAME,
    "",
    getExpiredInviteActivationCookieOptions()
  );

  redirect(ROLE_HOME_PATH[profile.role as keyof typeof ROLE_HOME_PATH]);
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const password = formValue(formData, "password");
  const passwordConfirmation = formValue(formData, "passwordConfirmation");

  if (password !== passwordConfirmation) {
    return { message: "Las contraseñas no coinciden." };
  }

  if (!isValidPassword(password)) {
    return { message: PASSWORD_POLICY_MESSAGE };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    const cookieStore = await cookies();
    const cookieNames = cookieStore.getAll().map((cookie) => cookie.name);
    const activationToken = verifyInviteActivationToken(
      cookieStore.get(INVITE_ACTIVATION_COOKIE_NAME)?.value
    );

    console.info("[auth_update_password] missing supabase session during password update", {
      hasInviteActivationCookie: cookieNames.includes(INVITE_ACTIVATION_COOKIE_NAME),
      cookieNames
    });

    if (activationToken) {
      return completePendingInviteActivation(activationToken.userId, password);
    }

    return { message: "El enlace expiró o la sesión no está activa." };
  }

  const { error } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    return { message: "No fue posible actualizar la contraseña." };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, role, account_status")
    .eq("id", user.id)
    .single();

  await supabaseAdmin
    .from("profiles")
    .update({
      account_status: "activo",
      failed_attempts: 0,
      locked_until: null
    })
    .eq("id", user.id);

  if (profile?.role) {
    await updateAuthUserAccessMetadata(user.id, {
      role: profile.role,
      accountStatus: "activo"
    });
  }

  await writeAuthAuditLog({
    event: "password_changed",
    actorId: user.id,
    email: user.email,
    result: "success"
  });

  const role = (profile?.role ?? "profesional") as keyof typeof ROLE_HOME_PATH;
  redirect(ROLE_HOME_PATH[role]);
}
