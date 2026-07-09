import type { GoogleCalendarConnection } from "@/lib/google-calendar/types";

type GoogleCalendarPanelProps = {
  connection: GoogleCalendarConnection | null;
};

export function GoogleCalendarPanel({ connection }: GoogleCalendarPanelProps) {
  const connected = connection?.connection_status === "conectado";

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Google Calendar</h2>
          <p className="mt-1 text-sm text-ink/65">
            {connected
              ? `Cuenta conectada: ${connection.google_account_email}. Las citas de Catholizare se sincronizan con Google Calendar.`
              : "Conecta Google Calendar para sincronizar citas y abrir tu calendario externo desde aqui."}
          </p>
        </div>
        <a
          href={connected ? "https://calendar.google.com/calendar/u/0/r" : "/professional/integrations"}
          target={connected ? "_blank" : undefined}
          rel={connected ? "noreferrer" : undefined}
          className="rounded-md bg-moss px-4 py-2 text-sm font-semibold text-white"
        >
          {connected ? "Abrir Google Calendar" : "Conectar Google Calendar"}
        </a>
      </div>
    </section>
  );
}
