import { requireRole } from "@/lib/auth/profile";

export default async function PortalPage() {
  const profile = await requireRole(["paciente"]);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <h1 className="text-3xl font-semibold text-ink">Portal del paciente</h1>
      <p className="mt-3 text-ink/70">Sesión activa para {profile.full_name}.</p>
    </main>
  );
}
