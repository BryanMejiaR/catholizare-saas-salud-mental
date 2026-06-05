import type { AdminAuditLog } from "@/lib/admin/types";

type AuditLogsTableProps = {
  logs: AdminAuditLog[];
};

export function AuditLogsTable({ logs }: AuditLogsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ink/5 text-ink/70">
          <tr>
            <th className="px-4 py-3 font-semibold">Fecha</th>
            <th className="px-4 py-3 font-semibold">Rol</th>
            <th className="px-4 py-3 font-semibold">Accion</th>
            <th className="px-4 py-3 font-semibold">Entidad</th>
            <th className="px-4 py-3 font-semibold">Resultado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="px-4 py-3 text-ink/70">
                {new Date(log.created_at).toLocaleString("es-MX")}
              </td>
              <td className="px-4 py-3 text-ink/70">{log.role ?? "sistema"}</td>
              <td className="px-4 py-3 font-medium text-ink">{log.action}</td>
              <td className="px-4 py-3 text-ink/70">{log.entity_type}</td>
              <td className="px-4 py-3 text-ink/70">{log.result}</td>
            </tr>
          ))}

          {logs.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-ink/60" colSpan={5}>
                No hay logs para mostrar.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
