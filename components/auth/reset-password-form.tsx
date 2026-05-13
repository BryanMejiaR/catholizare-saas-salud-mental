"use client";

import { useActionState } from "react";
import Link from "next/link";

import { requestPasswordResetAction } from "@/app/auth/actions";
import { AuthMessage } from "@/components/auth/auth-message";
import { SubmitButton } from "@/components/auth/submit-button";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordResetAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <AuthMessage message={state.message} />

      <label className="block">
        <span className="text-sm font-medium text-ink">Correo electrónico</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <SubmitButton>Enviar enlace</SubmitButton>

      <Link href="/auth/login" className="block text-center text-sm font-medium text-moss">
        Volver al inicio de sesión
      </Link>
    </form>
  );
}
