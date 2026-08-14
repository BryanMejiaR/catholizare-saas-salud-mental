import { SuperAdminPageHeader } from "@/components/super-admin/super-admin-page-header";
import { CreateUserForm } from "@/components/users/create-user-form";
import { UsersTable } from "@/components/users/users-table";
import { requireRole } from "@/lib/auth/profile";
import { getAllUserProfiles } from "@/lib/users/queries";

export default async function SuperAdminUsersPage() {
  const profile = await requireRole(["super_administrador"]);
  const users = await getAllUserProfiles();

  return (
    <main className="px-4 py-7 sm:px-7 sm:py-10 xl:px-12 xl:py-12">
      <div className="mx-auto max-w-[1380px] space-y-8">
        <SuperAdminPageHeader
          index="02"
          title="Usuarios y accesos"
          description="Administra cuentas globales, estados y perfiles autorizados dentro de Catholizare OS."
        />
        <CreateUserForm allowedRoles={["administrador", "super_administrador"]} />
        <UsersTable
          users={users}
          showStatusActions
          currentUserId={profile.id}
          professionalProfileBasePath="/super-admin/users/professionals"
        />
      </div>
    </main>
  );
}
