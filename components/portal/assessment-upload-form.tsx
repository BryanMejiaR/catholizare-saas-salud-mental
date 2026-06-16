"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import { uploadAssessmentDocumentAction } from "@/app/portal/actions";
import {
  PATIENT_ASSESSMENT_UPLOAD_LABEL,
  PATIENT_ASSESSMENT_UPLOAD_TYPES
} from "@/lib/evaluaciones/types";
import type {
  PortalAssessmentExpedienteOption,
  PortalAssessmentUpload
} from "@/lib/portal/types";

type AssessmentUploadFormProps = {
  expedientes: PortalAssessmentExpedienteOption[];
  uploads: PortalAssessmentUpload[];
};

const initialState = {
  message: "",
  ok: false
};

export function AssessmentUploadForm({ expedientes, uploads }: AssessmentUploadFormProps) {
  const [state, formAction] = useActionState(uploadAssessmentDocumentAction, initialState);
  const hasExpedientes = expedientes.length > 0;

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">Pruebas psicologicas</h2>
        <p className="mt-1 text-sm text-ink/65">
          Sube el archivo o foto de la prueba respondida para que tu profesional capture e
          interprete los resultados.
        </p>
      </div>

      <form action={formAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Expediente
          <select
            name="expedienteId"
            disabled={!hasExpedientes}
            className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
            required
          >
            {expedientes.map((expediente) => (
              <option key={expediente.id} value={expediente.id}>
                {expediente.professional.full_name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-ink">
          Prueba
          <select
            name="assessmentCode"
            disabled={!hasExpedientes}
            className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
            required
          >
            {PATIENT_ASSESSMENT_UPLOAD_TYPES.map((type) => (
              <option key={type} value={type}>
                {PATIENT_ASSESSMENT_UPLOAD_LABEL[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-ink md:col-span-2">
          Nombre si elegiste otra prueba
          <input
            name="otherAssessmentLabel"
            maxLength={120}
            disabled={!hasExpedientes}
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </label>

        <label className="text-sm font-medium text-ink md:col-span-2">
          Archivo o foto
          <input
            name="assessmentFile"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            disabled={!hasExpedientes}
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
            required
          />
        </label>

        <div className="md:col-span-2">
          <SubmitButton disabled={!hasExpedientes}>Enviar prueba</SubmitButton>
          {state.message ? (
            <p className={`mt-3 text-sm ${state.ok ? "text-moss" : "text-clay"}`}>
              {state.message}
            </p>
          ) : null}
          {!hasExpedientes ? (
            <p className="mt-3 text-sm text-ink/60">
              No hay un expediente activo disponible para recibir pruebas.
            </p>
          ) : null}
        </div>
      </form>

      <div className="mt-6 divide-y divide-ink/10">
        {uploads.map((upload) => (
          <div key={upload.id} className="py-3 first:pt-0 last:pb-0">
            <p className="text-sm font-medium text-ink">{upload.assessment_label}</p>
            <p className="mt-1 text-xs text-ink/55">
              {upload.file_name} | Estado: {upload.status} |{" "}
              {new Date(upload.created_at).toLocaleDateString("es-MX")}
            </p>
          </div>
        ))}

        {uploads.length === 0 ? (
          <p className="text-sm text-ink/65">Aun no has enviado pruebas.</p>
        ) : null}
      </div>
    </section>
  );
}
