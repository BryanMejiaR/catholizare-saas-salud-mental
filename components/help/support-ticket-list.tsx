import type { SupportTicket } from "@/lib/help/types";

type SupportTicketListProps = {
  tickets: SupportTicket[];
};

export function SupportTicketList({ tickets }: SupportTicketListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ink/5 text-ink/70">
          <tr>
            <th className="px-4 py-3 font-semibold">Asunto</th>
            <th className="px-4 py-3 font-semibold">Categoria</th>
            <th className="px-4 py-3 font-semibold">Prioridad</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td className="px-4 py-3 text-ink">{ticket.subject}</td>
              <td className="px-4 py-3 text-ink/70">{ticket.category}</td>
              <td className="px-4 py-3 text-ink/70">{ticket.priority}</td>
              <td className="px-4 py-3 text-ink/70">{ticket.status}</td>
              <td className="px-4 py-3 text-ink/70">
                {new Date(ticket.created_at).toLocaleDateString("es-MX")}
              </td>
            </tr>
          ))}
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-ink/60">
                No hay solicitudes de soporte recientes.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
