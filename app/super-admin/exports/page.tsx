import Link from "next/link";

import { ExportRequestReviewForm } from "@/components/data-export/export-request-review-form";
import { requireRole } from "@/lib/auth/profile";
import { getSuperAdminExportRequests } from "@/lib/data-export/queries";

export default async function SuperAdminExportsPage() {
  const profile = await requireRole(["super_administrador"]);
  const requests = await getSuperAdminExportRequests(profile);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Custodia legal
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">
              Solicitudes de exportacion
            </h1>
            <p className="mt-2 text-sm text-ink/65">
              Aprueba o rechaza descargas totales de expedientes. El link se muestra solo al
              aprobar.
            </p>
          </div>
          <Link href="/super-admin" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <div className="space-y-4">
          {requests.map((request) => (
            <article key={request.id} className="rounded-lg border border-ink/10 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{request.folio}</h2>
                  <p className="mt-1 text-sm text-ink/65">
                    {request.professional.full_name} | {request.professional.email}
                  </p>
                  <p className="mt-1 text-xs text-ink/55">
                    Estado: {request.status} |{" "}
                    {new Date(request.requested_at).toLocaleString("es-MX")}
                  </p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/70">
                {request.reason}
              </p>
              {request.status === "solicitada" ? (
                <ExportRequestReviewForm requestId={request.id} />
              ) : (
                <p className="mt-3 text-sm text-ink/60">
                  {request.status === "aprobada" && request.token_expires_at
                    ? `Aprobada. Link vigente hasta ${new Date(
                        request.token_expires_at
                      ).toLocaleString("es-MX")}.`
                    : `Solicitud ${request.status}.`}
                </p>
              )}
            </article>
          ))}

          {requests.length === 0 ? (
            <div className="rounded-lg border border-ink/10 bg-white px-4 py-6 text-center text-sm text-ink/60">
              No hay solicitudes para mostrar.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
