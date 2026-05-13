"use client";

import { useActionState } from "react";
import Link from "next/link";

import { loginAction } from "@/app/auth/actions";
import { AuthMessage } from "@/components/auth/auth-message";
import { SubmitButton } from "@/components/auth/submit-button";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, {});

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

      <label className="block">
        <span className="text-sm font-medium text-ink">Contraseña</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <SubmitButton>Iniciar sesión</SubmitButton>

      <Link href="/auth/reset-password" className="block text-center text-sm font-medium text-moss">
        Recuperar contraseña
      </Link>
    </form>
  );
}
