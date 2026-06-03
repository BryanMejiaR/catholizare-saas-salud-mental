import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import {
  getExpedientesForProcessStart,
  getProcesosForProfessional
} from "@/lib/procesos/queries";
import { ProcessesTable } from "@/components/procesos/processes-table";
import { StartProcessSelectorForm } from "@/components/procesos/start-process-selector-form";

export default async function ProfessionalProcesosPage() {
  const profile = await requireRole(["profesional"]);
  const [procesos, expedientes] = await Promise.all([
    getProcesosForProfessional(profile),
    getExpedientesForProcessStart(profile)
  ]);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Panel del profesional
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Procesos terapeuticos</h1>
            <p className="mt-2 text-sm text-ink/65">
              Modelos General configurable y TCC estructurado para cada caso clinico.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/professional/procesos/template" className="text-sm font-medium text-moss">
              Editar plantilla General
            </Link>
            <Link href="/professional" className="text-sm font-medium text-moss">
              Volver al panel
            </Link>
          </div>
        </div>

        <StartProcessSelectorForm expedientes={expedientes} />
        <ProcessesTable procesos={procesos} />
      </div>
    </main>
  );
}
