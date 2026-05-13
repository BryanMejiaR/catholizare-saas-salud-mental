"use client";

import { useActionState } from "react";

import { updatePasswordAction } from "@/app/auth/actions";
import { AuthMessage } from "@/components/auth/auth-message";
import { SubmitButton } from "@/components/auth/submit-button";

export function UpdatePasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <AuthMessage message={state.message} />

      <label className="block">
        <span className="text-sm font-medium text-ink">Nueva contraseña</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Confirmar contraseña</span>
        <input
          name="passwordConfirmation"
          type="password"
          autoComplete="new-password"
          required
          className="mt-2 h-11 w-full rounded-md border border-ink/15 px-3 text-ink outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <p className="text-xs leading-5 text-ink/60">
        Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
      </p>

      <SubmitButton>Guardar contraseña</SubmitButton>
    </form>
  );
}
