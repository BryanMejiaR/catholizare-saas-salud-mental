import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth/profile";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireRole(["administrador"]);

  return <AdminShell fullName={profile.full_name}>{children}</AdminShell>;
}
