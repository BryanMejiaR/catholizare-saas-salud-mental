import { PortalHeader } from "@/components/portal/portal-header";
import { requireRole } from "@/lib/auth/profile";

export default async function PortalLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireRole(["paciente"]);

  return (
    <div className="catholizare-app min-h-screen bg-grisMuyClaro text-principal">
      <PortalHeader fullName={profile.full_name} />
      {children}
    </div>
  );
}
