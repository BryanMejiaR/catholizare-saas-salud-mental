import type { HelpArticle } from "@/lib/help/types";

type HelpArticleListProps = {
  articles: HelpArticle[];
};

const defaultGuides = [
  {
    title: "Crear paciente y abrir expediente",
    category: "pacientes",
    summary: "Usa Gestionar pacientes para crear el perfil y luego abre el expediente clinico.",
    body: "Completa solo datos necesarios, registra consentimiento informado y evita duplicar pacientes."
  },
  {
    title: "Registrar notas clinicas",
    category: "notas",
    summary: "Crea una nota como borrador, revisa el contenido y confirma solo cuando este lista.",
    body: "Una nota de sesion puede editarse mientras esta en borrador. Al confirmarla queda protegida."
  },
  {
    title: "Usar evaluaciones psicologicas",
    category: "evaluaciones",
    summary: "Registra resultados y validalos antes de incorporarlos al expediente.",
    body: "No captures reactivos, manuales ni claves protegidas. La IA genera borradores que requieren validacion profesional."
  },
  {
    title: "Soporte tecnico sin datos clinicos",
    category: "seguridad",
    summary: "Cuando contactes soporte, describe el problema operativo sin revelar datos de pacientes.",
    body: "No pegues notas clinicas, expedientes, imagenes de pruebas ni identificadores sensibles en tickets."
  }
];

export function HelpArticleList({ articles }: HelpArticleListProps) {
  const rows =
    articles.length > 0
      ? articles
      : defaultGuides.map((guide, index) => ({
          id: `default-${index}`,
          status: "activo" as const,
          tags: [],
          created_by_user_id: null,
          created_at: "",
          updated_at: "",
          ...guide
        }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((article) => (
        <article key={article.id} className="rounded-lg border border-ink/10 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
            {article.category}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-ink">{article.title}</h3>
          <p className="mt-2 text-sm text-ink/65">{article.summary}</p>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-ink/75">{article.body}</p>
          {article.tags.length > 0 ? (
            <p className="mt-4 text-xs text-ink/50">{article.tags.join(", ")}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
