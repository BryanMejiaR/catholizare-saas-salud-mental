import type { HelpArticle, SupportTicket } from "@/lib/help/types";

type AdminHelpContentProps = {
  articles: HelpArticle[];
  tickets: SupportTicket[];
};

export function AdminHelpContent({ articles, tickets }: AdminHelpContentProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Articulos</h2>
        <div className="mt-4 space-y-3">
          {articles.map((article) => (
            <article key={article.id} className="rounded-md border border-ink/10 p-3">
              <p className="text-sm font-semibold text-ink">{article.title}</p>
              <p className="mt-1 text-xs text-ink/60">
                {article.category} | {article.status}
              </p>
              <p className="mt-2 text-sm text-ink/70">{article.summary}</p>
            </article>
          ))}
          {articles.length === 0 ? (
            <p className="text-sm text-ink/60">No hay articulos de ayuda creados.</p>
          ) : null}
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-5">
        <h2 className="text-lg font-semibold text-ink">Resumen de tickets</h2>
        <p className="mt-2 text-sm text-ink/65">
          Tickets visibles: {tickets.length}. No deben contener informacion clinica sensible.
        </p>
      </section>
    </div>
  );
}
