import { PortalAppointments } from "@/components/portal/portal-appointments";
import { PortalSummary } from "@/components/portal/portal-summary";
import { requireRole } from "@/lib/auth/profile";
import { getPortalDashboard } from "@/lib/portal/queries";

export default async function PortalPage() {
  const profile = await requireRole(["paciente"]);
  const dashboard = await getPortalDashboard(profile);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-ink">Portal del paciente</h1>
          <p className="mt-3 text-ink/70">Sesion activa para {profile.full_name}.</p>
        </div>

        <PortalSummary summary={dashboard.summary} />

        <PortalAppointments
          title="Proximas citas"
          appointments={dashboard.upcomingAppointments}
          emptyMessage="No tienes citas programadas."
          showRequests
        />

        <PortalAppointments
          title="Historial basico de citas"
          appointments={dashboard.pastAppointments}
          emptyMessage="Aun no hay citas pasadas para mostrar."
          showReviews
        />

        <section className="rounded-lg border border-ink/10 bg-white p-5">
          <h2 className="text-lg font-semibold text-ink">Solicitudes recientes</h2>
          <div className="mt-4 divide-y divide-ink/10">
            {dashboard.requests.map((request) => (
              <div key={request.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm font-medium text-ink">{request.request_type}</p>
                <p className="mt-1 text-xs text-ink/55">
                  Estado: {request.status} -{" "}
                  {new Date(request.created_at).toLocaleDateString("es-MX")}
                </p>
              </div>
            ))}

            {dashboard.requests.length === 0 ? (
              <p className="text-sm text-ink/65">No hay solicitudes recientes.</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
