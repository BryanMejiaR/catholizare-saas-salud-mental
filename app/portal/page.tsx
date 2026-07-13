import { PortalAppointments } from "@/components/portal/portal-appointments";
import { PortalSummary } from "@/components/portal/portal-summary";
import { LifeHistoryForm } from "@/components/portal/life-history-form";
import { AssessmentUploadForm } from "@/components/portal/assessment-upload-form";
import { requireRole } from "@/lib/auth/profile";
import { getPortalDashboard } from "@/lib/portal/queries";
import { StandardConsentPanel } from "@/components/portal/standard-consent-panel";
import { PatientAnnouncements } from "@/components/portal/patient-announcements";
import { PortalSectionShell } from "@/components/portal/portal-section-shell";
import { PortalPatientDashboard } from "@/components/portal/portal-patient-dashboard";
import { PortalRecommendationsPanel } from "@/components/portal/portal-recommendations-panel";
import { PortalConsentStatusPanel } from "@/components/portal/portal-consent-status-panel";
import { PortalProcessResourcesPanel } from "@/components/portal/portal-process-resources-panel";

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

        <PortalSectionShell
          sections={[
            {
              id: "dashboard",
              label: "Dashboard",
              content: (
                <div className="space-y-6">
                  <PortalPatientDashboard
                    processHistory={dashboard.processHistory}
                    upcomingAppointments={dashboard.upcomingAppointments}
                    consentStatuses={dashboard.consentStatuses}
                  />
                  <PortalRecommendationsPanel recommendations={dashboard.recommendations} />
                  <PatientAnnouncements announcements={dashboard.announcements} />
                </div>
              )
            },
            {
              id: "consentimiento",
              label: "Consentimiento",
              content: (
                <div className="space-y-6">
                  <PortalConsentStatusPanel statuses={dashboard.consentStatuses} />
                  <StandardConsentPanel consents={dashboard.standardConsents} />
                </div>
              )
            },
            {
              id: "historia",
              label: "Historia de vida",
              content: <LifeHistoryForm lifeHistory={dashboard.lifeHistory} />
            },
            {
              id: "pruebas",
              label: "Pruebas psicologicas",
              content: (
                <AssessmentUploadForm
                  requests={dashboard.assessmentRequests}
                  uploads={dashboard.assessmentUploads}
                />
              )
            },
            {
              id: "citas",
              label: "Citas y videollamada",
              content: (
                <div className="space-y-6">
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
                </div>
              )
            },
            {
              id: "procesos",
              label: "Procesos y recursos",
              content: (
                <PortalProcessResourcesPanel
                  processes={dashboard.processHistory}
                  links={dashboard.catholizareLinks}
                />
              )
            },
            {
              id: "solicitudes",
              label: "Solicitudes",
              content: (
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
              )
            },
            {
              id: "resumen",
              label: "Resumen compartido",
              content: <PortalSummary summary={dashboard.summary} />
            }
          ]}
        />
      </div>
    </main>
  );
}
