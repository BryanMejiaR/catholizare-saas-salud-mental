import { LogoutButton } from "@/components/auth/logout-button";
import { requireRole } from "@/lib/auth/profile";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireRole(["administrador"]);

  return (
    <>
      <LogoutButton fullName={profile.full_name} />
      {children}
    </>
  );
}
