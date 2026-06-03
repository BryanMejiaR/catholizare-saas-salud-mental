import { LogoutButton } from "@/components/auth/logout-button";
import { requireRole } from "@/lib/auth/profile";

export default async function SuperAdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireRole(["super_administrador"]);

  return (
    <>
      <LogoutButton fullName={profile.full_name} />
      {children}
    </>
  );
}
