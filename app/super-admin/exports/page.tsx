import { ExportRequestReviewForm } from "@/components/data-export/export-request-review-form";
import { SuperAdminPageHeader } from "@/components/super-admin/super-admin-page-header";
import { requireRole } from "@/lib/auth/profile";
import { getSuperAdminExportRequests } from "@/lib/data-export/queries";

export default async function SuperAdminExportsPage() {
  const profile = await requireRole(["super_administrador"]);
  const requests = await getSuperAdminExportRequests(profile);

  return (
    <main className="px-4 py-7 sm:px-7 sm:py-10 xl:px-12 xl:py-12">
      <div className="mx-auto max-w-[1380px] space-y-8">
        <SuperAdminPageHeader
          index="05"
          title="Solicitudes de exportacion"
          description="Aprueba o rechaza descargas totales de expedientes bajo el flujo de custodia legal."
        />

        <div className="space-y-4">
          {requests.map((request) => (
            <article key={request.id} className="border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">{request.folio}</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {request.professional.full_name} | {request.professional.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Estado: {request.status} | {new Date(request.requested_at).toLocaleString("es-MX")}
                  </p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                {request.reason}
              </p>
              {request.status === "solicitada" ? (
                <ExportRequestReviewForm requestId={request.id} />
              ) : (
                <p className="mt-3 text-sm text-slate-600">
                  {request.status === "aprobada" && request.token_expires_at
                    ? `Aprobada. Link vigente hasta ${new Date(request.token_expires_at).toLocaleString("es-MX")}.`
                    : `Solicitud ${request.status}.`}
                </p>
              )}
            </article>
          ))}

          {requests.length === 0 ? (
            <div className="border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
              No hay solicitudes para mostrar.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
