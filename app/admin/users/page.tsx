import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CreateUserForm } from "@/components/users/create-user-form";
import { UsersTable } from "@/components/users/users-table";
import { requireRole } from "@/lib/auth/profile";
import { getAllUserProfiles, getProfessionalProfiles } from "@/lib/users/queries";

export default async function AdminUsersPage() {
  const profile = await requireRole(["administrador"]);
  const [users, professionals] = await Promise.all([getAllUserProfiles(), getProfessionalProfiles()]);

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10 xl:py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminPageHeader
          eyebrow="Personas y accesos"
          title="Usuarios"
          description="Crea cuentas, administra estados y consulta la actividad general de los perfiles autorizados."
        />

        <CreateUserForm allowedRoles={["profesional", "paciente"]} professionals={professionals} />
        <UsersTable
          users={users.filter((user) => user.role !== "super_administrador")}
          showStatusActions
          currentUserId={profile.id}
          professionalProfileBasePath="/admin/users/professionals"
        />
      </div>
    </main>
  );
}
