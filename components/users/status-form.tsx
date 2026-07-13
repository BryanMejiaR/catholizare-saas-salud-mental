"use client";

import { useActionState } from "react";

import { setUserStatusAction } from "@/app/users/actions";
import { ActionMessage } from "@/components/users/action-message";
import type { AccountStatus } from "@/lib/auth/types";

type StatusFormProps = {
  userId: string;
  currentStatus: AccountStatus;
};

export function StatusForm({ userId, currentStatus }: StatusFormProps) {
  const [state, formAction] = useActionState(setUserStatusAction, {});
  const actions =
    currentStatus === "activo"
      ? [
          { status: "inactivo", label: "Desactivar" },
          { status: "bloqueado", label: "Pausar" }
        ]
      : currentStatus === "pendiente_activacion"
        ? []
        : [{ status: "activo", label: "Reactivar" }];

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="userId" value={userId} />
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.status}
            name="accountStatus"
            value={action.status}
            type="submit"
            className="rounded-md border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
          >
            {action.label}
          </button>
        ))}
        {actions.length === 0 ? <span className="text-sm text-ink/55">Pendiente</span> : null}
      </div>
      <ActionMessage message={state.message} ok={state.ok} />
    </form>
  );
}
