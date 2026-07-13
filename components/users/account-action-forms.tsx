"use client";

import { useActionState } from "react";

import {
  deletePendingActivationUserAction,
  resendActivationEmailAction,
  sendPasswordChangeEmailAction
} from "@/app/users/actions";
import { ActionMessage } from "@/components/users/action-message";

type AccountActionFormsProps = {
  userId: string;
  isPendingActivation: boolean;
};

function ActionForm({
  userId,
  label,
  action,
  danger = false
}: {
  userId: string;
  label: string;
  action: typeof resendActivationEmailAction;
  danger?: boolean;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-1">
      <input type="hidden" name="userId" value={userId} />
      <button
        type="submit"
        className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
          danger
            ? "border-clay/30 text-clay hover:bg-clay hover:text-white"
            : "border-ink/15 text-ink hover:border-moss hover:text-moss"
        }`}
      >
        {label}
      </button>
      <ActionMessage message={state.message} ok={state.ok} />
    </form>
  );
}

export function AccountActionForms({ userId, isPendingActivation }: AccountActionFormsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {isPendingActivation ? (
        <ActionForm
          userId={userId}
          label="Reenviar activacion"
          action={resendActivationEmailAction}
        />
      ) : null}
      <ActionForm
        userId={userId}
        label="Enviar cambio de contraseña"
        action={sendPasswordChangeEmailAction}
      />
      {isPendingActivation ? (
        <ActionForm
          userId={userId}
          label="Eliminar pendiente"
          action={deletePendingActivationUserAction}
          danger
        />
      ) : null}
    </div>
  );
}
