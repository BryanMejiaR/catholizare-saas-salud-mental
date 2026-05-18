import { AuthShell } from "@/components/auth/auth-shell";

export default function InactiveAccountPage() {
  return (
    <AuthShell
      title="Cuenta no activa"
      subtitle="Tu cuenta está inactiva o bloqueada temporalmente. Contacta al equipo que administra tu acceso."
    >
      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink"
        >
          Cerrar sesión
        </button>
      </form>
    </AuthShell>
  );
}
