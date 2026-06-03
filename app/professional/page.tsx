import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";

export default async function ProfessionalPage() {
  const profile = await requireRole(["profesional"]);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <h1 className="text-3xl font-semibold text-ink">Panel del profesional</h1>
      <p className="mt-3 text-ink/70">Sesión activa para {profile.full_name}.</p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link className="inline-flex font-medium text-moss" href="/professional/patients">
          Gestionar pacientes
        </Link>
        <Link className="inline-flex font-medium text-moss" href="/professional/expedientes">
          Gestionar expedientes
        </Link>
        <Link className="inline-flex font-medium text-moss" href="/professional/notas">
          Consultar notas clinicas
        </Link>
        <Link className="inline-flex font-medium text-moss" href="/professional/procesos">
          Gestionar procesos
        </Link>
        <Link className="inline-flex font-medium text-moss" href="/professional/agenda">
          Gestionar agenda
        </Link>
        <Link className="inline-flex font-medium text-moss" href="/professional/integrations">
          Gestionar integraciones
        </Link>
      </div>
    </main>
  );
}
