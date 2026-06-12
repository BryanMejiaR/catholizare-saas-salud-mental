"use client";

import { useActionState } from "react";

import {
  createHelpArticleAction,
  updateHelpArticleStatusAction,
  updateSupportTicketStatusAction
} from "@/app/help/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import {
  HELP_ARTICLE_STATUSES,
  SUPPORT_TICKET_STATUSES,
  type HelpArticle,
  type SupportTicket
} from "@/lib/help/types";

export function CreateHelpArticleForm() {
  const [state, formAction] = useActionState(createHelpArticleAction, {});

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Crear articulo de ayuda</h2>
      <ActionMessage message={state.message} ok={state.ok} />
      <label className="block">
        <span className="text-sm font-medium text-ink">Titulo</span>
        <input name="title" className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">Resumen</span>
        <textarea name="summary" rows={3} className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-ink">Contenido</span>
        <textarea name="body" rows={7} className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Categoria</span>
          <input name="category" className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-ink">Estado</span>
          <select name="status" defaultValue="borrador" className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2">
            {HELP_ARTICLE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-ink">Etiquetas separadas por coma</span>
        <input name="tags" className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2" />
      </label>
      <SubmitButton>Crear articulo</SubmitButton>
    </form>
  );
}

export function AdminSupportTickets({ tickets }: { tickets: SupportTicket[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ink/5 text-ink/70">
          <tr>
            <th className="px-4 py-3 font-semibold">Asunto</th>
            <th className="px-4 py-3 font-semibold">Categoria</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Actualizar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {tickets.map((ticket) => (
            <AdminSupportTicketRow key={ticket.id} ticket={ticket} />
          ))}
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-ink/60">
                No hay tickets de soporte.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export function AdminHelpArticles({ articles }: { articles: HelpArticle[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink/10 bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-ink/5 text-ink/70">
          <tr>
            <th className="px-4 py-3 font-semibold">Articulo</th>
            <th className="px-4 py-3 font-semibold">Categoria</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Actualizar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {articles.map((article) => (
            <AdminHelpArticleRow key={article.id} article={article} />
          ))}
          {articles.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-ink/60">
                No hay articulos de ayuda.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function AdminHelpArticleRow({ article }: { article: HelpArticle }) {
  const [state, formAction] = useActionState(updateHelpArticleStatusAction, {});

  return (
    <tr>
      <td className="px-4 py-3">
        <p className="font-medium text-ink">{article.title}</p>
        <p className="mt-1 line-clamp-2 text-xs text-ink/60">{article.summary}</p>
        <ActionMessage message={state.message} ok={state.ok} />
      </td>
      <td className="px-4 py-3 text-ink/70">{article.category}</td>
      <td className="px-4 py-3 text-ink/70">{article.status}</td>
      <td className="px-4 py-3">
        <form action={formAction} className="flex gap-2">
          <input type="hidden" name="articleId" value={article.id} />
          <select name="status" defaultValue={article.status} className="rounded-md border border-ink/15 px-2 py-1">
            {HELP_ARTICLE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md bg-moss px-3 py-1 text-xs font-semibold text-white">
            Guardar
          </button>
        </form>
      </td>
    </tr>
  );
}

function AdminSupportTicketRow({ ticket }: { ticket: SupportTicket }) {
  const [state, formAction] = useActionState(updateSupportTicketStatusAction, {});

  return (
    <tr>
      <td className="px-4 py-3">
        <p className="font-medium text-ink">{ticket.subject}</p>
        <p className="mt-1 line-clamp-2 text-xs text-ink/60">{ticket.description}</p>
        <ActionMessage message={state.message} ok={state.ok} />
      </td>
      <td className="px-4 py-3 text-ink/70">{ticket.category}</td>
      <td className="px-4 py-3 text-ink/70">{ticket.status}</td>
      <td className="px-4 py-3">
        <form action={formAction} className="flex gap-2">
          <input type="hidden" name="ticketId" value={ticket.id} />
          <select name="status" defaultValue={ticket.status} className="rounded-md border border-ink/15 px-2 py-1">
            {SUPPORT_TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md bg-moss px-3 py-1 text-xs font-semibold text-white">
            Guardar
          </button>
        </form>
      </td>
    </tr>
  );
}
