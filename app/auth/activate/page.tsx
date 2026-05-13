import Link from "next/link";

import { AuthShell } from "@/components/auth/auth-shell";

export default function ActivatePage() {
  return (
    <AuthShell
      title="Activación de cuenta"
      subtitle="Abre el enlace de activación enviado por correo para crear tu contraseña."
    >
      <Link
        href="/auth/login"
        className="inline-flex h-11 w-full items-center justify-center rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink"
      >
        Ir al inicio de sesión
      </Link>
    </AuthShell>
  );
}
