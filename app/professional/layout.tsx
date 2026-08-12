import { Montserrat } from "next/font/google";

import { ProfessionalTopBar } from "@/components/professional/professional-top-bar";
import { requireRole } from "@/lib/auth/profile";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap"
});

export default async function ProfessionalLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await requireRole(["profesional"]);

  return (
    <div className={`${montserrat.className} min-h-screen bg-blanco text-texto`}>
      <ProfessionalTopBar fullName={profile.full_name} />
      {children}
    </div>
  );
}
