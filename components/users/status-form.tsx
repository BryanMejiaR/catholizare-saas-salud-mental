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
  const nextStatus = currentStatus === "inactivo" ? "activo" : "inactivo";

  if (currentStatus === "pendiente_activacion" || currentStatus === "bloqueado") {
    return <span className="text-sm text-ink/55">{currentStatus}</span>;
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="accountStatus" value={nextStatus} />
      <button
        type="submit"
        className="rounded-md border border-ink/15 px-3 py-1.5 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
      >
        {nextStatus === "activo" ? "Reactivar" : "Desactivar"}
      </button>
      <ActionMessage message={state.message} ok={state.ok} />
    </form>
  );
}
