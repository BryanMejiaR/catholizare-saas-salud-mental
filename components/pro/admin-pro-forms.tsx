"use client";

import { useActionState } from "react";

import {
  createProBannerAction,
  createProEventAction,
  createProResourceAction
} from "@/app/pro/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import { PRO_BANNER_TYPES, PRO_CONTENT_STATUSES, PRO_RESOURCE_TYPES } from "@/lib/pro/types";

function Field({
  name,
  label,
  type = "text",
  placeholder
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
      />
    </label>
  );
}

function Textarea({ name, label }: { name: string; label: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <textarea
        name={name}
        className="mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
      />
    </label>
  );
}

export function CreateProResourceForm() {
  const [state, formAction] = useActionState(createProResourceAction, {});

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Crear recurso</h2>
      <ActionMessage message={state.message} ok={state.ok} />
      <Field name="title" label="Titulo" />
      <Textarea name="description" label="Descripcion" />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Tipo</span>
          <select name="resourceType" className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2">
            {PRO_RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <Field name="category" label="Categoria" placeholder="Mentoria, Fichas clinicas..." />
        <Field name="url" label="URL" type="url" />
        <Field name="tags" label="Etiquetas separadas por coma" />
        <Field name="displaySections" label="Secciones" placeholder="resources,dashboard" />
        <Field name="sortOrder" label="Orden" type="number" />
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input name="featured" type="checkbox" />
        Destacado
      </label>
      <select name="status" className="w-full rounded-md border border-ink/15 px-3 py-2">
        {PRO_CONTENT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <SubmitButton>Crear recurso</SubmitButton>
    </form>
  );
}

export function CreateProBannerForm() {
  const [state, formAction] = useActionState(createProBannerAction, {});

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Crear banner</h2>
      <ActionMessage message={state.message} ok={state.ok} />
      <Field name="title" label="Titulo" />
      <Textarea name="body" label="Cuerpo" />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Tipo</span>
          <select name="bannerType" className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2">
            {PRO_BANNER_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <Field name="displaySections" label="Secciones" placeholder="dashboard,agenda" />
        <Field name="ctaLabel" label="Texto del boton" />
        <Field name="ctaUrl" label="URL del boton" type="url" />
        <Field name="priority" label="Prioridad" type="number" />
        <select name="status" className="mt-7 w-full rounded-md border border-ink/15 px-3 py-2">
          {PRO_CONTENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input name="dismissible" type="checkbox" defaultChecked />
        El profesional puede cerrarlo
      </label>
      <SubmitButton>Crear banner</SubmitButton>
    </form>
  );
}

export function CreateProEventForm() {
  const [state, formAction] = useActionState(createProEventAction, {});

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Crear evento</h2>
      <ActionMessage message={state.message} ok={state.ok} />
      <Field name="title" label="Titulo" />
      <Textarea name="description" label="Descripcion" />
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="eventType" label="Tipo de evento" placeholder="Contagio de Fe" />
        <Field name="startsAt" label="Fecha y hora" type="datetime-local" />
        <Field name="modality" label="Modalidad" placeholder="online" />
        <Field name="infoUrl" label="URL de informacion" type="url" />
        <Field name="registrationUrl" label="URL de registro" type="url" />
      </div>
      <SubmitButton>Crear evento</SubmitButton>
    </form>
  );
}
