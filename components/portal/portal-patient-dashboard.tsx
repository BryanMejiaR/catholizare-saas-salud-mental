import type {
  PortalAppointment,
  PortalConsentStatus,
  PortalProcessHistory
} from "@/lib/portal/types";

type PortalPatientDashboardProps = {
  processHistory: PortalProcessHistory[];
  upcomingAppointments: PortalAppointment[];
  consentStatuses: PortalConsentStatus[];
};

function daysSince(value: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000)));
}

export function PortalPatientDashboard({
  processHistory,
  upcomingAppointments,
  consentStatuses
}: PortalPatientDashboardProps) {
  const activeProcess = processHistory.find((process) => process.status === "activo");
  const therapists = new Set(processHistory.map((process) => process.professional.full_name));
  const signedConsentCount = consentStatuses.filter((consent) =>
    ["firmado_fisico", "firmado_digital", "excepcion_justificada"].includes(consent.status)
  ).length;

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Dashboard</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-md border border-ink/10 bg-linen p-4">
          <p className="text-xs text-ink/55">Sesiones proximas</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{upcomingAppointments.length}</p>
        </div>
        <div className="rounded-md border border-ink/10 bg-linen p-4">
          <p className="text-xs text-ink/55">Proceso actual</p>
          <p className="mt-2 text-2xl font-semibold text-ink">
            {activeProcess ? `${daysSince(activeProcess.started_at)} d` : "0 d"}
          </p>
        </div>
        <div className="rounded-md border border-ink/10 bg-linen p-4">
          <p className="text-xs text-ink/55">Terapeutas</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{therapists.size}</p>
        </div>
        <div className="rounded-md border border-ink/10 bg-linen p-4">
          <p className="text-xs text-ink/55">Consentimientos firmados</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{signedConsentCount}</p>
        </div>
      </div>
    </section>
  );
}
