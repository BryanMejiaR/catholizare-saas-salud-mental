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
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit"
  });
}

function firstName(fullName: string) {
  return fullName.trim().split(" ")[0] || fullName;
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
  const pendingConsent = consentStatuses.some((consent) => consent.status === "pendiente");
  const signedConsentCount = consentStatuses.filter((consent) =>
    ["firmado_fisico", "firmado_digital", "excepcion_justificada"].includes(consent.status)
  ).length;
  const whatsappText = encodeURIComponent(
    `Hola mi nombre ${patientFullName}, me gustaria integrarme a un grupo de oracion`
  );
  const whatsappPrayerGroupUrl = `https://wa.me/525510223883?text=${whatsappText}`;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-lg bg-principal text-blanco">
        <div className="grid gap-6 px-5 py-6 sm:px-7 md:grid-cols-[minmax(0,1fr)_300px] md:items-center md:py-8">
          <div>
            <p className="text-sm font-semibold text-enfasis">Hola, {firstName(patientFullName)}</p>
            <h2 className="mt-2 max-w-xl text-2xl font-bold leading-tight sm:text-3xl">
              Tu espacio para continuar tu proceso con calma y claridad.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blanco/75">
              Aqui encuentras tus proximos pasos, citas y recursos compartidos.
            </p>
          </div>

          <div className="border-l-4 border-enfasis bg-blanco px-4 py-4 text-principal">
            <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">Lo siguiente</p>
            <p className="mt-2 text-base font-bold">
              {nextAppointment ? "Tu proxima sesion" : "Sin sesiones programadas"}
            </p>
            <p className="mt-1 text-sm leading-5 text-principal/65">
              {nextAppointment
                ? formatAppointmentDate(nextAppointment.scheduled_at)
                : "Cuando tengas una nueva cita, aparecera aqui."}
            </p>
            <button
              type="button"
              data-portal-section-target="citas"
              className="mt-4 min-h-10 rounded-md bg-azulMedio px-4 text-sm font-bold text-blanco transition hover:bg-secundario"
            >
              {nextAppointment ? "Ver proxima cita" : "Ver mis citas"}
            </button>
          </div>
        </div>
      </section>

      {pendingConsent ? (
        <section className="flex flex-col gap-4 border-l-4 border-rojoRompe bg-blanco p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-principal">Tienes un consentimiento pendiente</p>
            <p className="mt-1 text-sm text-principal/65">
              Revisa el documento y completa la firma para continuar tu atencion.
            </p>
          </div>
          <button
            type="button"
            data-portal-section-target="consentimiento"
            className="min-h-10 shrink-0 rounded-md bg-principal px-4 text-sm font-bold text-blanco transition hover:bg-secundario"
          >
            Revisar consentimiento
          </button>
        </section>
      ) : null}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">Resumen</p>
            <h2 className="mt-1 text-xl font-bold text-principal">Tu proceso en un vistazo</h2>
          </div>
          {activeProcess ? (
            <p className="text-sm font-medium text-principal/60">{activeProcess.model_label}</p>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-principal/10 bg-principal/10 md:grid-cols-4">
          <div className="bg-blanco p-4 sm:p-5">
            <p className="text-xs font-medium text-grisTextos">Proximas sesiones</p>
            <p className="mt-2 text-2xl font-bold text-principal">{upcomingAppointments.length}</p>
          </div>
          <div className="bg-blanco p-4 sm:p-5">
            <p className="text-xs font-medium text-grisTextos">Tiempo en proceso</p>
            <p className="mt-2 text-2xl font-bold text-principal">
              {activeProcess ? `${daysSince(activeProcess.started_at)} dias` : "Sin iniciar"}
            </p>
          </div>
          <div className="bg-blanco p-4 sm:p-5">
            <p className="text-xs font-medium text-grisTextos">Profesionales</p>
            <p className="mt-2 text-2xl font-bold text-principal">{therapists.size}</p>
          </div>
          <div className="bg-blanco p-4 sm:p-5">
            <p className="text-xs font-medium text-grisTextos">Consentimientos</p>
            <p className="mt-2 text-2xl font-bold text-principal">{signedConsentCount}</p>
          </div>
        </div>
      </section>

      <section>
        <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">Accesos rapidos</p>
        <h2 className="mt-1 text-xl font-bold text-principal">Que quieres hacer?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <QuickAction
            title="Agendar una sesion"
            description="Esta funcion estara disponible proximamente."
            actionLabel="Proximamente"
            disabled
          />
          <QuickAction
            title="Ver citas y videollamadas"
            description="Consulta horarios, enlaces y sesiones anteriores."
            actionLabel="Ir a mis citas"
            target="citas"
          />
          <QuickAction
            title="Evaluar una sesion"
            description="Tu respuesta es confidencial y ayuda a mejorar la atencion."
            actionLabel="Evaluar"
            target="citas"
          />
          <QuickAction
            title="Encontrar otro terapeuta"
            description="Explora opciones para iniciar un nuevo proceso."
            actionLabel="Ver opciones"
            target="procesos"
          />
          <QuickAction
            title="Atencion al cliente"
            description="Solicita ayuda con tu cuenta o con el uso del portal."
            actionLabel="Pedir ayuda"
            target="soporte"
          />
          <QuickAction
            title="Recursos para ti"
            description="Encuentra lecturas de acuerdo con tus temas de interes."
            actionLabel="Ver recursos"
            target="recursos"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4 border border-principal/10 bg-blanco p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-principal">Oracion en grupo</p>
          <p className="mt-1 text-sm leading-6 text-principal/65">
            Si eres catolico y deseas integrarte, puedes enviar un mensaje por WhatsApp.
          </p>
        </div>
        <a
          href={whatsappPrayerGroupUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-principal px-4 text-sm font-bold text-principal transition hover:bg-principal hover:text-blanco"
        >
          Enviar mensaje
        </a>
      </section>
    </div>
  );
}

type QuickActionProps = {
  title: string;
  description: string;
  actionLabel: string;
  target?: string;
  disabled?: boolean;
};

function QuickAction({ title, description, actionLabel, target, disabled }: QuickActionProps) {
  return (
    <article className="flex min-h-[178px] flex-col border border-principal/10 bg-blanco p-5 transition hover:border-azulMedio">
      <div className="mb-4 h-1 w-10 bg-enfasis" />
      <h3 className="font-bold text-principal">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-5 text-principal/60">{description}</p>
      <button
        type="button"
        data-portal-section-target={target}
        disabled={disabled}
        className="mt-4 min-h-10 self-start rounded-md bg-principal px-4 text-sm font-bold text-blanco transition hover:bg-secundario disabled:cursor-not-allowed disabled:bg-grisMedio"
      >
        {actionLabel}
      </button>
    </article>
  );
}
