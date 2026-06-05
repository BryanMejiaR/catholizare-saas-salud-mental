import Link from "next/link";

import { disconnectGoogleCalendarAction } from "@/app/integrations/google-calendar/actions";
import { disconnectZoomAction } from "@/app/integrations/zoom/actions";
import { requireRole } from "@/lib/auth/profile";
import {
  getGoogleCalendarConnection,
  isGoogleCalendarConfigured
} from "@/lib/google-calendar/connections";
import { getZoomConnection, isZoomConfigured } from "@/lib/zoom/connections";

type ProfessionalIntegrationsPageProps = {
  searchParams?: Promise<{
    gcal?: string;
    zoom?: string;
  }>;
};

const GCAL_MESSAGES: Record<string, string> = {
  connected: "Google Calendar conectado correctamente.",
  disconnected: "Google Calendar desconectado.",
  error: "No fue posible conectar Google Calendar.",
  disconnect_error: "No fue posible desconectar Google Calendar.",
  invalid_state: "La solicitud de conexion expiro o no es valida.",
  not_configured: "Google Calendar aun no esta configurado en este entorno."
};

const ZOOM_MESSAGES: Record<string, string> = {
  connected: "Zoom conectado correctamente.",
  disconnected: "Zoom desconectado.",
  error: "No fue posible conectar Zoom.",
  disconnect_error: "No fue posible desconectar Zoom.",
  invalid_state: "La solicitud de conexion expiro o no es valida.",
  not_configured: "Zoom aun no esta configurado en este entorno."
};

export default async function ProfessionalIntegrationsPage({
  searchParams
}: ProfessionalIntegrationsPageProps) {
  const profile = await requireRole(["profesional"]);
  const params = await searchParams;
  const [gcalConnection, zoomConnection] = await Promise.all([
    getGoogleCalendarConnection(profile.id),
    getZoomConnection(profile.id)
  ]);
  const isGcalConfigured = isGoogleCalendarConfigured();
  const isZoomConnectionConfigured = isZoomConfigured();
  const isGcalConnected = gcalConnection?.connection_status === "conectado";
  const isZoomConnected = zoomConnection?.connection_status === "conectado";
  const gcalMessage = params?.gcal ? GCAL_MESSAGES[params.gcal] : null;
  const zoomMessage = params?.zoom ? ZOOM_MESSAGES[params.zoom] : null;

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Panel del profesional
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Integraciones</h1>
            <p className="mt-2 text-sm text-ink/65">
              Conecta servicios externos por cuenta profesional. Las citas siguen funcionando sin
              integraciones activas.
            </p>
          </div>
          <Link href="/professional" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        {gcalMessage ? (
          <p className="rounded-md border border-ink/10 bg-white px-4 py-3 text-sm text-ink">
            {gcalMessage}
          </p>
        ) : null}

        {zoomMessage ? (
          <p className="rounded-md border border-ink/10 bg-white px-4 py-3 text-sm text-ink">
            {zoomMessage}
          </p>
        ) : null}

        <section className="rounded-lg border border-ink/10 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Google Calendar</h2>
              <p className="mt-1 text-sm text-ink/65">
                Sincroniza las citas creadas o canceladas en Catholizare con el calendario principal
                del profesional.
              </p>
            </div>
            <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink/70">
              {isGcalConnected ? "Conectado" : gcalConnection?.connection_status ?? "Sin conectar"}
            </span>
          </div>

          {gcalConnection ? (
            <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="font-medium text-ink">Cuenta</dt>
                <dd className="mt-1 text-ink/65">{gcalConnection.google_account_email}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Ultima actualizacion</dt>
                <dd className="mt-1 text-ink/65">
                  {new Date(gcalConnection.updated_at).toLocaleString("es-MX")}
                </dd>
              </div>
              {gcalConnection.last_sync_error ? (
                <div className="md:col-span-2">
                  <dt className="font-medium text-ink">Ultimo error</dt>
                  <dd className="mt-1 text-ink/65">{gcalConnection.last_sync_error}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {isGcalConnected ? (
              <form action={disconnectGoogleCalendarAction}>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-clay px-4 text-sm font-semibold text-white transition hover:bg-ink"
                >
                  Desconectar
                </button>
              </form>
            ) : (
              <a
                href={isGcalConfigured ? "/api/integrations/google-calendar/start" : "#"}
                aria-disabled={!isGcalConfigured}
                className="inline-flex h-11 items-center justify-center rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink aria-disabled:pointer-events-none aria-disabled:opacity-60"
              >
                Conectar Google Calendar
              </a>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-ink/10 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Zoom</h2>
              <p className="mt-1 text-sm text-ink/65">
                Genera enlaces de reunion para citas de videollamada bajo la cuenta Zoom del
                profesional.
              </p>
            </div>
            <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink/70">
              {isZoomConnected ? "Conectado" : zoomConnection?.connection_status ?? "Sin conectar"}
            </span>
          </div>

          {zoomConnection ? (
            <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="font-medium text-ink">Cuenta</dt>
                <dd className="mt-1 text-ink/65">{zoomConnection.zoom_account_email}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Ultima actualizacion</dt>
                <dd className="mt-1 text-ink/65">
                  {new Date(zoomConnection.updated_at).toLocaleString("es-MX")}
                </dd>
              </div>
              {zoomConnection.last_sync_error ? (
                <div className="md:col-span-2">
                  <dt className="font-medium text-ink">Ultimo error</dt>
                  <dd className="mt-1 text-ink/65">{zoomConnection.last_sync_error}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {isZoomConnected ? (
              <form action={disconnectZoomAction}>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-clay px-4 text-sm font-semibold text-white transition hover:bg-ink"
                >
                  Desconectar
                </button>
              </form>
            ) : (
              <a
                href={isZoomConnectionConfigured ? "/api/integrations/zoom/start" : "#"}
                aria-disabled={!isZoomConnectionConfigured}
                className="inline-flex h-11 items-center justify-center rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink aria-disabled:pointer-events-none aria-disabled:opacity-60"
              >
                Conectar Zoom
              </a>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
