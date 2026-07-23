import Link from "next/link";

import { HelpArticleList } from "@/components/help/help-article-list";
import { SupportTicketForm } from "@/components/help/support-ticket-form";
import { SupportTicketList } from "@/components/help/support-ticket-list";
import { requireRole } from "@/lib/auth/profile";
import { getProfessionalHelpDashboard } from "@/lib/help/queries";

const faqItems = [
  {
    question: "Puedo enviar datos de pacientes por soporte?",
    answer: "No. Usa soporte solo para dudas operativas y describe el problema sin datos clinicos."
  },
  {
    question: "Que informacion ayuda a resolver un ticket?",
    answer:
      "Incluye el modulo, los pasos para reproducir el problema, el mensaje de error y capturas sin datos clinicos."
  },
  {
    question: "Donde pido apoyo clinico o supervision?",
    answer: "Usa los recursos de Catholizare Pro, mentorias o revision de casos; no el ticket tecnico."
  }
];

export default async function ProfessionalHelpPage() {
  const profile = await requireRole(["profesional"]);
  const help = await getProfessionalHelpDashboard(profile);

  return (
    <main className="min-h-screen bg-linen px-6 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">
              Centro de ayuda
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Soporte operativo</h1>
            <p className="mt-2 text-sm text-ink/65">
              Guias de uso, preguntas frecuentes y contacto tecnico sin contenido clinico.
            </p>
          </div>
          <Link href="/professional" className="text-sm font-medium text-moss">
            Volver al panel
          </Link>
        </div>

        <section className="rounded-lg border border-clay/30 bg-clay/10 p-5">
          <h2 className="text-lg font-semibold text-ink">Separacion clinica</h2>
          <p className="mt-2 text-sm leading-6 text-ink/75">
            Este modulo no accede a expedientes, notas, evaluaciones ni imagenes clinicas. Para
            soporte tecnico, describe pasos, errores o pantallas sin incluir datos de Pacientes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-ink">Guias y articulos</h2>
          <HelpArticleList articles={help.articles} />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-lg border border-ink/10 bg-white p-5">
              <h3 className="text-sm font-semibold text-ink">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/70">{item.answer}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <SupportTicketForm />
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-ink">Solicitudes recientes</h2>
            <SupportTicketList tickets={help.tickets} />
          </section>
        </div>
      </div>
    </main>
  );
}
