import { LogoutButton } from "@/components/auth/logout-button";
import { AppBreadcrumbs } from "@/components/navigation/app-breadcrumbs";
import { requireRole } from "@/lib/auth/profile";

export default async function AdminLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireRole(["administrador"]);

  return (
    <>
      <AppBreadcrumbs homeHref="/admin" />
      <LogoutButton fullName={profile.full_name} />
      {children}
    </>
  );
}
