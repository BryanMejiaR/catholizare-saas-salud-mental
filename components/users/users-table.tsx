import type { UserManagementProfile } from "@/lib/users/types";
import { StatusForm } from "@/components/users/status-form";

type UsersTableProps = {
  users: UserManagementProfile[];
  showStatusActions?: boolean;
};

export function UsersTable({ users, showStatusActions = false }: UsersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ink/5 text-ink/70">
          <tr>
            <th className="px-4 py-3 font-semibold">Nombre</th>
            <th className="px-4 py-3 font-semibold">Correo</th>
            <th className="px-4 py-3 font-semibold">Rol</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            {showStatusActions ? <th className="px-4 py-3 font-semibold">Acción</th> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 font-medium text-ink">{user.full_name}</td>
              <td className="px-4 py-3 text-ink/70">{user.email}</td>
              <td className="px-4 py-3 text-ink/70">{user.role}</td>
              <td className="px-4 py-3 text-ink/70">{user.account_status}</td>
              {showStatusActions ? (
                <td className="px-4 py-3">
                  <StatusForm userId={user.id} currentStatus={user.account_status} />
                </td>
              ) : null}
            </tr>
          ))}

          {users.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-center text-ink/60" colSpan={showStatusActions ? 5 : 4}>
                No hay usuarios para mostrar.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
