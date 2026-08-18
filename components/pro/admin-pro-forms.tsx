"use client";

import { useActionState } from "react";

import {
  createPatientBannerAction,
  createPatientEventAction,
  createPatientResourceAction,
  createProBannerAction,
  createProEventAction,
  createProResourceAction
} from "@/app/pro/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import {
  PRO_BANNER_TYPE_LABEL,
  PRO_BANNER_TYPES,
  PRO_CONTENT_STATUSES,
  PRO_RESOURCE_TYPE_LABEL,
  PRO_RESOURCE_TYPES
} from "@/lib/pro/types";

function toLocalDateTimeInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  defaultValue
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-azulMedio focus:ring-2 focus:ring-azulMedio/20"
      />
    </label>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  options
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue ?? options[0]?.value}
        className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-azulMedio focus:ring-2 focus:ring-azulMedio/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ name, label }: { name: string; label: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <textarea
        name={name}
        className="mt-2 min-h-24 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-azulMedio focus:ring-2 focus:ring-azulMedio/20"
      />
    </label>
  );
}

function ImageField() {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">Imagen opcional</span>
      <input
        name="imageFile"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
      />
      <span className="mt-1 block text-xs text-ink/55">JPG, PNG, WEBP o GIF. Maximo 5 MB.</span>
    </label>
  );
}

const PRO_SECTION_OPTIONS = [
  { value: "dashboard", label: "Dashboard" },
  { value: "resources", label: "Recursos" },
  { value: "agenda", label: "Agenda" }
];

const PATIENT_SECTION_OPTIONS = [
  { value: "portal", label: "Portal del paciente" },
  { value: "dashboard", label: "Dashboard" },
  { value: "resources", label: "Recursos" }
];

const ORDER_OPTIONS = Array.from({ length: 11 }, (_, index) => ({
  value: String(index),
  label: index === 0 ? "0 - Predeterminado" : String(index)
}));

const MODALITY_OPTIONS = [
  { value: "online", label: "Online" },
  { value: "presencial", label: "Presencial" },
  { value: "hibrida", label: "Hibrida" },
  { value: "por_confirmar", label: "Por confirmar" }
];

function displaySectionOptions(patient: boolean) {
  return patient ? PATIENT_SECTION_OPTIONS : PRO_SECTION_OPTIONS;
}

export function CreateProResourceForm({ patient = false }: { patient?: boolean }) {
  const [state, formAction] = useActionState(
    patient ? createPatientResourceAction : createProResourceAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div className="border-b border-principal/10 pb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">Nuevo contenido</p>
        <h2 className="mt-1 text-lg font-bold text-principal">Crear recurso</h2>
      </div>
      <ActionMessage message={state.message} ok={state.ok} />
      <Field name="title" label="Titulo" />
      <Textarea name="description" label="Descripcion" />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Tipo</span>
          <select name="resourceType" className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2">
            {PRO_RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {PRO_RESOURCE_TYPE_LABEL[type] ?? type}
              </option>
            ))}
          </select>
        </label>
        <Field name="category" label="Categoria" placeholder="Mentoria, Fichas clinicas..." />
        <Field name="url" label="URL" type="url" />
        <Field name="tags" label="Etiquetas separadas por coma" />
        <SelectField
          name="displaySections"
          label="Secciones"
          defaultValue={patient ? "portal" : "resources"}
          options={displaySectionOptions(patient)}
        />
        <SelectField name="sortOrder" label="Orden" options={ORDER_OPTIONS} />
      </div>
      <ImageField />
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

export function CreateProBannerForm({ patient = false }: { patient?: boolean }) {
  const [state, formAction] = useActionState(
    patient ? createPatientBannerAction : createProBannerAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div className="border-b border-principal/10 pb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">Nuevo contenido</p>
        <h2 className="mt-1 text-lg font-bold text-principal">Crear banner</h2>
      </div>
      <ActionMessage message={state.message} ok={state.ok} />
      <Field name="title" label="Titulo" />
      <Textarea name="body" label="Cuerpo" />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-ink">Tipo</span>
          <select name="bannerType" className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2">
            {PRO_BANNER_TYPES.map((type) => (
              <option key={type} value={type}>
                {PRO_BANNER_TYPE_LABEL[type] ?? type}
              </option>
            ))}
          </select>
        </label>
        <SelectField
          name="displaySections"
          label="Secciones"
          defaultValue={patient ? "portal" : "dashboard"}
          options={displaySectionOptions(patient)}
        />
        <Field name="ctaLabel" label="Texto del boton" />
        <Field name="ctaUrl" label="URL del boton" type="url" />
        <SelectField name="priority" label="Prioridad" options={ORDER_OPTIONS} />
        <select name="status" className="mt-7 w-full rounded-md border border-ink/15 px-3 py-2">
          {PRO_CONTENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>
      <ImageField />
      <label className="flex items-center gap-2 text-sm text-ink">
        <input name="dismissible" type="checkbox" defaultChecked />
        {patient ? "El paciente puede cerrarlo" : "El profesional puede cerrarlo"}
      </label>
      <SubmitButton>Crear banner</SubmitButton>
    </form>
  );
}

export function CreateProEventForm({ patient = false }: { patient?: boolean }) {
  const [state, formAction] = useActionState(
    patient ? createPatientEventAction : createProEventAction,
    {}
  );
  const defaultStartsAt = toLocalDateTimeInputValue(new Date(Date.now() + 60 * 60 * 1000));

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div className="border-b border-principal/10 pb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">Nuevo contenido</p>
        <h2 className="mt-1 text-lg font-bold text-principal">Crear evento</h2>
      </div>
      <ActionMessage message={state.message} ok={state.ok} />
      <Field name="title" label="Titulo" />
      <Textarea name="description" label="Descripcion" />
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="eventType" label="Tipo de evento" placeholder="Contagio de Fe" />
        <Field
          name="startsAt"
          label="Fecha y hora"
          type="datetime-local"
          defaultValue={defaultStartsAt}
        />
        <SelectField name="modality" label="Modalidad" options={MODALITY_OPTIONS} />
        <Field name="infoUrl" label="URL de informacion" type="url" />
        <Field name="registrationUrl" label="URL de registro" type="url" />
      </div>
      <ImageField />
      <SubmitButton>Crear evento</SubmitButton>
    </form>
  );
}
