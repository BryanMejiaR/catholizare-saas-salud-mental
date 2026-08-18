import Link from "next/link";

import { ProfessionalExportRequestForm } from "@/components/data-export/professional-export-request-form";
import { requireRole } from "@/lib/auth/profile";
import { getProfessionalExportRequests } from "@/lib/data-export/queries";

export default async function ProfessionalExportPage() {
  const profile = await requireRole(["profesional"]);
  const requests = await getProfessionalExportRequests(profile);

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-azulMedio">
              Exportacion total
            </p>
            <h1 className="mt-1 text-2xl font-bold text-principal sm:text-3xl">Descarga de expedientes</h1>
            <p className="mt-2 text-sm text-ink/65">
              Solicita autorizacion para descargar tus expedientes y archivos clinicos.
            </p>
          </div>
          <Link href="/professional" className="text-sm font-medium text-azulMedio">
            Volver al panel
          </Link>
        </div>

        <ProfessionalExportRequestForm />

        <section className="rounded-lg border border-ink/10 bg-white p-5">
          <h2 className="text-lg font-bold text-principal">Solicitudes recientes</h2>
          <div className="mt-4 divide-y divide-ink/10">
            {requests.map((request) => (
              <div key={request.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-semibold text-ink">
                  {request.folio} | {request.status}
                </p>
                <p className="mt-1 text-xs text-ink/55">
                  Solicitada: {new Date(request.requested_at).toLocaleString("es-MX")}
                  {request.token_expires_at
                    ? ` | Link expira: ${new Date(request.token_expires_at).toLocaleString("es-MX")}`
                    : ""}
                </p>
                {request.accepted_at ? (
                  <p className="mt-1 text-xs text-ink/55">
                    Aceptacion: {request.acceptance_folio} |{" "}
                    {new Date(request.accepted_at).toLocaleString("es-MX")}
                  </p>
                ) : null}
              </div>
            ))}

            {requests.length === 0 ? (
              <p className="text-sm text-ink/65">No hay solicitudes registradas.</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
