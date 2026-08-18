"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
};

export function SubmitButton({ children, disabled = false }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex h-11 w-full items-center justify-center rounded-md bg-azulMedio px-4 text-sm font-bold text-blanco transition hover:bg-secundario disabled:cursor-not-allowed disabled:bg-grisMedio disabled:opacity-100"
    >
      {pending ? "Procesando..." : children}
    </button>
  );
}
