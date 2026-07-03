import Link from "next/link";

import { StatusForm } from "@/components/users/status-form";
import type { UserManagementProfile } from "@/lib/users/types";

type UsersTableProps = {
  users: UserManagementProfile[];
  showStatusActions?: boolean;
  currentUserId?: string;
  expedienteLinksByUserId?: Record<string, string>;
};

export function UsersTable({
  users,
  showStatusActions = false,
  currentUserId,
  expedienteLinksByUserId
}: UsersTableProps) {
  const showExpedienteLinks = Boolean(expedienteLinksByUserId);

  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ink/5 text-ink/70">
          <tr>
            <th className="px-4 py-3 font-semibold">Nombre</th>
            <th className="px-4 py-3 font-semibold">Correo</th>
            <th className="px-4 py-3 font-semibold">Rol</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            {showExpedienteLinks ? <th className="px-4 py-3 font-semibold">Expediente</th> : null}
            {showStatusActions ? <th className="px-4 py-3 font-semibold">Accion</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 font-medium text-ink">{user.full_name}</td>
              <td className="px-4 py-3 text-ink/70">{user.email}</td>
              <td className="px-4 py-3 text-ink/70">{user.role}</td>
              <td className="px-4 py-3 text-ink/70">{user.account_status}</td>
              {showExpedienteLinks ? (
                <td className="px-4 py-3">
                  {expedienteLinksByUserId?.[user.id] ? (
                    <Link
                      href={expedienteLinksByUserId[user.id]}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-moss px-3 text-xs font-semibold text-white transition hover:bg-ink"
                    >
                      Abrir expediente
                    </Link>
                  ) : (
                    <span className="text-xs text-ink/50">Sin expediente activo</span>
                  )}
                </td>
              ) : null}
              {showStatusActions ? (
                <td className="px-4 py-3">
                  {user.id === currentUserId ? (
                    <span className="text-sm text-ink/55">Cuenta actual</span>
                  ) : (
                    <StatusForm userId={user.id} currentStatus={user.account_status} />
                  )}
                </td>
              ) : null}
            </tr>
          ))}

          {users.length === 0 ? (
            <tr>
              <td
                className="px-4 py-6 text-center text-ink/60"
                colSpan={4 + (showExpedienteLinks ? 1 : 0) + (showStatusActions ? 1 : 0)}
              >
                No hay usuarios para mostrar.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
