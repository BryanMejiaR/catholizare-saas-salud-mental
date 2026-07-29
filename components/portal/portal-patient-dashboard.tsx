import type {
  PortalAppointment,
  PortalConsentStatus,
  PortalProcessHistory
} from "@/lib/portal/types";

type PortalPatientDashboardProps = {
  patientFullName: string;
  processHistory: PortalProcessHistory[];
  upcomingAppointments: PortalAppointment[];
  consentStatuses: PortalConsentStatus[];
};

function daysSince(value: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000)));
}

function formatAppointmentDate(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function PortalPatientDashboard({
  patientFullName,
  processHistory,
  upcomingAppointments,
  consentStatuses
}: PortalPatientDashboardProps) {
  const activeProcess = processHistory.find((process) => process.status === "activo");
  const therapists = new Set(processHistory.map((process) => process.professional.full_name));
  const nextAppointment = upcomingAppointments[0];
  const whatsappText = encodeURIComponent(
    `Hola mi nombre ${patientFullName}, me gustaria integrarme a un grupo de oracion`
  );
  const whatsappPrayerGroupUrl = `https://wa.me/525510223883?text=${whatsappText}`;
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

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-ink/10 p-4">
          <p className="text-sm font-semibold text-ink">Agendar sesion</p>
          <p className="mt-1 text-xs text-ink/60">Prototipo pendiente de activar.</p>
          <button
            type="button"
            disabled
            className="mt-3 inline-flex h-9 items-center rounded-md bg-ink/10 px-3 text-xs font-semibold text-ink/45"
          >
            Proximamente
          </button>
        </div>

        <div className="rounded-md border border-ink/10 p-4">
          <p className="text-sm font-semibold text-ink">Consigue un nuevo logro</p>
          <p className="mt-1 text-xs text-ink/60">Encuentra un terapeuta para iniciar otro proceso.</p>
          <button
            type="button"
            data-portal-section-target="procesos"
            className="mt-3 inline-flex h-9 items-center rounded-md bg-moss px-3 text-xs font-semibold text-white"
          >
            Encuentra un terapeuta
          </button>
        </div>

        <div className="rounded-md border border-ink/10 p-4">
          <p className="text-sm font-semibold text-ink">Proxima sesion</p>
          <p className="mt-1 text-xs text-ink/60">
            {nextAppointment ? formatAppointmentDate(nextAppointment.scheduled_at) : "Sin citas programadas"}
          </p>
          <button
            type="button"
            data-portal-section-target="citas"
            className="mt-3 inline-flex h-9 items-center rounded-md bg-moss px-3 text-xs font-semibold text-white"
          >
            Ver citas
          </button>
        </div>

        <div className="rounded-md border border-ink/10 p-4">
          <p className="text-sm font-semibold text-ink">Oracion en grupo</p>
          <p className="mt-1 text-xs text-ink/60">
            Si eres catolico y quieres integrarte, abre WhatsApp con un mensaje prellenado.
          </p>
          <a
            href={whatsappPrayerGroupUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex h-9 items-center rounded-md bg-moss px-3 text-xs font-semibold text-white"
          >
            Quiero hacer oracion en grupo
          </a>
        </div>

        <div className="rounded-md border border-ink/10 p-4">
          <p className="text-sm font-semibold text-ink">Evalua tus sesiones</p>
          <p className="mt-1 text-xs text-ink/60">
            No olvides evaluar tus sesiones. Es confidencial; el profesional no podra ver lo que
            escribas.
          </p>
          <button
            type="button"
            data-portal-section-target="citas"
            className="mt-3 inline-flex h-9 items-center rounded-md bg-moss px-3 text-xs font-semibold text-white"
          >
            Ir a evaluaciones
          </button>
        </div>

        <div className="rounded-md border border-ink/10 p-4">
          <p className="text-sm font-semibold text-ink">Atencion al cliente</p>
          <p className="mt-1 text-xs text-ink/60">Acceso rapido a ayuda operativa.</p>
          <button
            type="button"
            data-portal-section-target="soporte"
            className="mt-3 inline-flex h-9 items-center rounded-md bg-moss px-3 text-xs font-semibold text-white"
          >
            Ir a soporte
          </button>
        </div>

        <div className="rounded-md border border-ink/10 p-4">
          <p className="text-sm font-semibold text-ink">Recursos</p>
          <p className="mt-1 text-xs text-ink/60">Lecturas segun tus temas de interes.</p>
          <button
            type="button"
            data-portal-section-target="recursos"
            className="mt-3 inline-flex h-9 items-center rounded-md bg-moss px-3 text-xs font-semibold text-white"
          >
            Ver recursos
          </button>
        </div>
      </div>
    </section>
  );
}
