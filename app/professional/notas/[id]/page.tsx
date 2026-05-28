import Link from "next/link";

import { prepareNotaExportAction } from "@/app/notas/actions";
import { requireRole } from "@/lib/auth/profile";
import { getAddendumsForNota, getNotaClinicaDetail } from "@/lib/notas/queries";
import { AddendumForm } from "@/components/notas/addendum-form";
import { AnnulNotaForm } from "@/components/notas/annul-nota-form";
import { NotaDetailForm } from "@/components/notas/nota-detail-form";
import { NotasTable } from "@/components/notas/notas-table";

type NotaClinicaDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function NotaClinicaDetailPage({ params }: NotaClinicaDetailPageProps) {
  const [{ id }, profile] = await Promise.all([params, requireRole(["profesional"])]);
  const note = await getNotaClinicaDetail(profile, id);
  const addendums = note.note_type === "addendum" ? [] : await getAddendumsForNota(profile, note.id);
  const canExport = ["confirmada", "con_addendum", "exportada"].includes(note.status);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Nota clinica
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">{note.note_type}</h1>
            <p className="mt-2 text-sm text-ink/65">
              Fecha: {new Date(note.session_date).toLocaleDateString("es-MX")} | Estado:{" "}
              {note.status}
            </p>
          </div>
          <Link
            href={`/professional/expedientes/${note.expediente_id}`}
            className="text-sm font-medium text-moss"
          >
            Volver al expediente
          </Link>
          {canExport ? (
            <form action={prepareNotaExportAction}>
              <input type="hidden" name="noteId" value={note.id} />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink"
              >
                Exportar PDF
              </button>
            </form>
          ) : null}
        </div>

        <NotaDetailForm note={note} />
        {note.note_type !== "addendum" ? (
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">Addendums vinculados</h2>
              <p className="mt-1 text-sm text-ink/65">
                Correcciones y aclaraciones conservadas junto a la nota original.
              </p>
            </div>
            <NotasTable notas={addendums} emptyMessage="Esta nota no tiene addendums." />
          </section>
        ) : null}
        <AddendumForm note={note} />
        <AnnulNotaForm note={note} />
      </div>
    </main>
  );
}
