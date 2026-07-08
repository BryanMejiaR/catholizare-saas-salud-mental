import { LogoutButton } from "@/components/auth/logout-button";
import { AppBreadcrumbs } from "@/components/navigation/app-breadcrumbs";
import { requireRole } from "@/lib/auth/profile";

export default async function PortalLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireRole(["paciente"]);

  return (
    <>
      <AppBreadcrumbs homeHref="/portal" />
      <LogoutButton fullName={profile.full_name} />
      {children}
    </>
  );
}
