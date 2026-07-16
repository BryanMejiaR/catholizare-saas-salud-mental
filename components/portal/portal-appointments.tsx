import { openZoomJoinUrlAction } from "@/app/portal/actions";
import { AppointmentRequestForm } from "@/components/portal/appointment-request-form";
import { ExperienceReviewForm } from "@/components/portal/experience-review-form";
import type { PortalAppointment } from "@/lib/portal/types";

type PortalAppointmentsProps = {
  title: string;
  appointments: PortalAppointment[];
  emptyMessage: string;
  showRequests?: boolean;
  showReviews?: boolean;
};

function formatAppointmentDate(value: string) {
  return new Date(value).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function PortalAppointments({
  title,
  appointments,
  emptyMessage,
  showRequests = false,
  showReviews = false
}: PortalAppointmentsProps) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-4 divide-y divide-ink/10">
        {appointments.map((appointment) => (
          <article key={appointment.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{formatAppointmentDate(appointment.scheduled_at)}</p>
                <p className="mt-1 text-sm text-ink/65">
                  {appointment.duration_minutes} min - {appointment.type} -{" "}
                  {appointment.professional.full_name}
                </p>
                <p className="mt-1 text-xs text-ink/55">Estado: {appointment.status}</p>
                {appointment.has_zoom_link && !appointment.can_join_zoom ? (
                  <p className="mt-2 text-xs font-medium text-ink/60">
                    Videollamada por Zoom disponible 24 horas antes de la cita.
                  </p>
                ) : null}
              </div>

              {appointment.can_join_zoom ? (
                <form action={openZoomJoinUrlAction}>
                  <input type="hidden" name="appointmentId" value={appointment.id} />
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink"
                  >
                    Iniciar videollamada por Zoom
                  </button>
                </form>
              ) : null}
            </div>

            {appointment.cancellation_reason ? (
              <p className="mt-2 text-xs text-ink/55">{appointment.cancellation_reason}</p>
            ) : null}

            {showRequests && appointment.can_request_change ? (
              <AppointmentRequestForm appointmentId={appointment.id} />
            ) : null}

            {showReviews && appointment.can_review ? (
              <ExperienceReviewForm appointmentId={appointment.id} />
            ) : null}

            {showReviews && appointment.has_review ? (
              <p className="mt-3 text-xs text-ink/55">Evaluacion enviada.</p>
            ) : null}
          </article>
        ))}

        {appointments.length === 0 ? <p className="text-sm text-ink/65">{emptyMessage}</p> : null}
      </div>
    </section>
  );
}
