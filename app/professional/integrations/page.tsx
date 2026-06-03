import Link from "next/link";

import { disconnectGoogleCalendarAction } from "@/app/integrations/google-calendar/actions";
import { requireRole } from "@/lib/auth/profile";
import {
  getGoogleCalendarConnection,
  isGoogleCalendarConfigured
} from "@/lib/google-calendar/connections";

type ProfessionalIntegrationsPageProps = {
  searchParams?: Promise<{
    gcal?: string;
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

export default async function ProfessionalIntegrationsPage({
  searchParams
}: ProfessionalIntegrationsPageProps) {
  const profile = await requireRole(["profesional"]);
  const params = await searchParams;
  const connection = await getGoogleCalendarConnection(profile.id);
  const isConfigured = isGoogleCalendarConfigured();
  const isConnected = connection?.connection_status === "conectado";
  const message = params?.gcal ? GCAL_MESSAGES[params.gcal] : null;

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

        {message ? (
          <p className="rounded-md border border-ink/10 bg-white px-4 py-3 text-sm text-ink">
            {message}
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
              {isConnected ? "Conectado" : connection?.connection_status ?? "Sin conectar"}
            </span>
          </div>

          {connection ? (
            <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
              <div>
                <dt className="font-medium text-ink">Cuenta</dt>
                <dd className="mt-1 text-ink/65">{connection.google_account_email}</dd>
              </div>
              <div>
                <dt className="font-medium text-ink">Ultima actualizacion</dt>
                <dd className="mt-1 text-ink/65">
                  {new Date(connection.updated_at).toLocaleString("es-MX")}
                </dd>
              </div>
              {connection.last_sync_error ? (
                <div className="md:col-span-2">
                  <dt className="font-medium text-ink">Ultimo error</dt>
                  <dd className="mt-1 text-ink/65">{connection.last_sync_error}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {isConnected ? (
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
                href={isConfigured ? "/api/integrations/google-calendar/start" : "#"}
                aria-disabled={!isConfigured}
                className="inline-flex h-11 items-center justify-center rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink aria-disabled:pointer-events-none aria-disabled:opacity-60"
              >
                Conectar Google Calendar
              </a>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
