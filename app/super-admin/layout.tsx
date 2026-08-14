import { SuperAdminShell } from "@/components/super-admin/super-admin-shell";
import { requireRole } from "@/lib/auth/profile";

export default async function SuperAdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireRole(["super_administrador"]);

  return <SuperAdminShell fullName={profile.full_name}>{children}</SuperAdminShell>;
}
