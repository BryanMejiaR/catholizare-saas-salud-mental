import Link from "next/link";

import { requireRole } from "@/lib/auth/profile";
import { getAllUserProfiles } from "@/lib/users/queries";
import { CreateUserForm } from "@/components/users/create-user-form";
import { UsersTable } from "@/components/users/users-table";

export default async function SuperAdminUsersPage() {
  await requireRole(["super_administrador"]);
  const users = await getAllUserProfiles();

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Catholizare
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Administradores</h1>
          </div>
          <Link href="/super-admin" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <CreateUserForm allowedRoles={["administrador", "super_administrador"]} />
        <UsersTable
          users={users.filter(
            (user) => user.role === "administrador" || user.role === "super_administrador"
          )}
          showStatusActions
        />
      </div>
    </main>
  );
}
