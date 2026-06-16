import { createHash } from "crypto";
import Link from "next/link";

import { ExportAcceptanceForm } from "@/components/data-export/export-acceptance-form";
import { requireRole } from "@/lib/auth/profile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ProfessionalExportAcceptancePageProps = {
  params: Promise<{
    token: string;
  }>;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export default async function ProfessionalExportAcceptancePage({
  params
}: ProfessionalExportAcceptancePageProps) {
  const [{ token }, profile] = await Promise.all([params, requireRole(["profesional"])]);
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: request } = await supabaseAdmin
    .from("professional_export_requests")
    .select("id, folio, professional_id, status, token_expires_at, accepted_at, acceptance_folio")
    .eq("approval_token_hash", sha256(token))
    .maybeSingle();
  const isValid =
    request &&
    request.professional_id === profile.id &&
    request.status === "aprobada" &&
    request.token_expires_at &&
    new Date(request.token_expires_at).getTime() > Date.now();

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Exportacion autorizada
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">
              Aceptacion de responsabilidad
            </h1>
            <p className="mt-2 text-sm text-ink/65">
              La descarga queda ligada a tu sesion, folio, IP y hash del paquete.
            </p>
          </div>
          <Link href="/professional/export" className="text-sm font-medium text-moss">
            Volver
          </Link>
        </div>

        {!isValid ? (
          <div className="rounded-lg border border-clay/30 bg-white p-5 text-sm text-ink">
            El link no es valido, no pertenece a tu cuenta o ya expiro.
          </div>
        ) : request.accepted_at ? (
          <section className="rounded-lg border border-ink/10 bg-white p-5">
            <h2 className="text-lg font-semibold text-ink">Aceptacion registrada</h2>
            <p className="mt-2 text-sm text-ink/65">
              Folio: {request.acceptance_folio}. Ya puedes descargar el ZIP.
            </p>
            <a
              href={`/professional/export/${token}/download`}
              className="mt-4 inline-flex rounded-md bg-moss px-4 py-3 text-sm font-semibold text-white"
            >
              Descargar ZIP
            </a>
          </section>
        ) : (
          <ExportAcceptanceForm
            token={token}
            defaultFullName={profile.full_name}
            defaultEmail={profile.email}
          />
        )}
      </div>
    </main>
  );
}
