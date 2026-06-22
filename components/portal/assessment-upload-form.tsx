"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/auth/submit-button";
import { uploadAssessmentDocumentAction } from "@/app/portal/actions";
import type {
  PortalAssessmentRequest,
  PortalAssessmentUpload
} from "@/lib/portal/types";

type AssessmentUploadFormProps = {
  requests: PortalAssessmentRequest[];
  uploads: PortalAssessmentUpload[];
};

const initialState = {
  message: "",
  ok: false
};

export function AssessmentUploadForm({ requests, uploads }: AssessmentUploadFormProps) {
  const [state, formAction] = useActionState(uploadAssessmentDocumentAction, initialState);
  const pendingRequests = requests.filter((request) => request.status === "pendiente");

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">Pruebas psicologicas</h2>
        <p className="mt-1 text-sm text-ink/65">
          Sube el archivo o foto de la prueba respondida para que tu profesional capture e
          interprete los resultados.
        </p>
      </div>

      <div className="mt-5 space-y-4">
        {pendingRequests.map((request) => (
          <form key={request.id} action={formAction} className="rounded-md border border-ink/10 p-4">
            <input type="hidden" name="requestId" value={request.id} />
            <p className="text-sm font-semibold text-ink">{request.assessment_label}</p>
            <p className="mt-1 text-xs text-ink/55">
              Solicitada: {new Date(request.requested_at).toLocaleDateString("es-MX")}
            </p>
            <label className="mt-3 block text-sm font-medium text-ink">
              Archivo o foto
              <input
                name="assessmentFile"
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
                required
              />
            </label>
            <div className="mt-3">
              <SubmitButton>Enviar {request.assessment_label}</SubmitButton>
            </div>
          </form>
        ))}

        {state.message ? (
          <p className={`text-sm ${state.ok ? "text-moss" : "text-clay"}`}>
            {state.message}
          </p>
        ) : null}

        {pendingRequests.length === 0 ? (
          <p className="text-sm text-ink/65">
            No tienes pruebas pendientes solicitadas por tu profesional.
          </p>
        ) : null}
      </div>

      <div className="mt-6 divide-y divide-ink/10">
        {requests
          .filter((request) => request.status !== "pendiente")
          .map((request) => (
            <div key={request.id} className="py-3 first:pt-0 last:pb-0">
              <p className="text-sm font-medium text-ink">{request.assessment_label}</p>
              <p className="mt-1 text-xs text-ink/55">
                Estado: {request.status} |{" "}
                {new Date(request.requested_at).toLocaleDateString("es-MX")}
              </p>
            </div>
          ))}

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
