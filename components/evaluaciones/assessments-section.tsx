import { AssessmentAiDraftForm } from "@/components/evaluaciones/assessment-ai-draft-form";
import { AssessmentUploadResultsForm } from "@/components/evaluaciones/assessment-upload-results-form";
import { CreateAssessmentForm } from "@/components/evaluaciones/create-assessment-form";
import { ValidateAssessmentForm } from "@/components/evaluaciones/validate-assessment-form";
import type { PatientAssessmentUpload, PsychologicalAssessment } from "@/lib/evaluaciones/types";

type AssessmentsSectionProps = {
  expedienteId: string;
  assessments: PsychologicalAssessment[];
  uploads: PatientAssessmentUpload[];
  disabled?: boolean;
};

const assessmentTypeLabels: Record<PsychologicalAssessment["assessment_type"], string> = {
  inventario: "Inventario",
  cuestionario: "Cuestionario",
  escala_clinica: "Escala clinica",
  personalidad: "Personalidad",
  proyectiva: "Proyectiva",
  entrevista_estructurada: "Entrevista estructurada",
  psicometrica_externa: "Psicometrica externa",
  clinica_no_estandarizada: "Clinica no estandarizada",
  otra: "Otra"
};

function formatClinicalDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-MX");
}

export function AssessmentsSection({
  expedienteId,
  assessments,
  uploads,
  disabled = false
}: AssessmentsSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-ink">Evaluaciones psicologicas</h2>
        <p className="mt-1 text-sm text-ink/65">
          Registro clinico de resultados. El MVP no almacena bancos de pruebas, reactivos ni
          manuales protegidos.
        </p>
      </div>

      <CreateAssessmentForm expedienteId={expedienteId} disabled={disabled} />

      <div className="rounded-lg border border-ink/10 bg-white p-5">
        <h3 className="text-base font-semibold text-ink">Pruebas enviadas por paciente</h3>
        <p className="mt-1 text-sm text-ink/65">
          Archivos recibidos desde el portal. Aqui se muestran resultados estructurados, no
          reactivos ni contenido protegido de pruebas.
        </p>

        <div className="mt-4 divide-y divide-ink/10">
          {uploads.map((upload) => (
            <div key={upload.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{upload.assessment_label}</p>
                  <p className="mt-1 text-xs text-ink/55">
                    Estado: {upload.status} | Archivo: {upload.file_name} |{" "}
                    {new Date(upload.created_at).toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>
              <ResultsTable
                assessmentCode={upload.assessment_code}
                results={upload.extracted_results}
              />
              <AssessmentUploadResultsForm upload={upload} disabled={disabled} />
            </div>
          ))}

          {uploads.length === 0 ? (
            <p className="text-sm text-ink/65">El paciente aun no ha enviado pruebas.</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment) => {
          const canEdit = !disabled && ["borrador", "analizada"].includes(assessment.status);

          return (
            <article key={assessment.id} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-ink">{assessment.assessment_name}</h3>
                  <p className="mt-1 text-sm text-ink/65">
                    {assessmentTypeLabels[assessment.assessment_type]} | Estado: {assessment.status}
                  </p>
                  <p className="mt-1 text-xs text-ink/50">
                    Aplicada: {formatClinicalDate(assessment.applied_at)} | Validacion:{" "}
                    {assessment.professional_validation_status}
                  </p>
                </div>
              </div>

              <p className="text-sm leading-6 text-ink/70">{assessment.assessment_purpose}</p>

              {assessment.ai_draft_interpretation ? (
                <div className="rounded-md border border-moss/20 bg-moss/5 p-3">
                  <p className="text-xs font-semibold uppercase text-ink/50">Borrador IA</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">
                    {assessment.ai_draft_interpretation}
                  </p>
                </div>
              ) : null}

              <AssessmentAiDraftForm assessmentId={assessment.id} disabled={!canEdit} />
              <ValidateAssessmentForm assessment={assessment} disabled={!canEdit} />
            </article>
          );
        })}

        {assessments.length === 0 ? (
          <div className="rounded-lg border border-ink/10 bg-white px-4 py-6 text-center text-sm text-ink/60">
            No hay evaluaciones registradas para este expediente.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ResultsTable({
  assessmentCode,
  results
}: {
  assessmentCode: string;
  results: Record<string, unknown>;
}) {
  const entries = Object.entries(results).filter(([, value]) => value !== null && value !== "");

  if (entries.length === 0) {
    return (
      <p className="mt-3 rounded-md border border-ink/10 bg-linen px-3 py-2 text-xs text-ink/60">
        Resultados pendientes de captura o interpretacion.
      </p>
    );
  }

  if (assessmentCode === "etra") {
    return <EtraResultsTable results={results} />;
  }

  if (assessmentCode === "bdi") {
    return <BdiResultsTable results={results} />;
  }

  if (assessmentCode === "ysq") {
    return <YsqResultsTable results={results} />;
  }

  if (assessmentCode === "pbq_s") {
    return <PbqResultsTable results={results} />;
  }

  return (
    <div className="mt-3 overflow-hidden rounded-md border border-ink/10">
      <table className="w-full text-left text-xs">
        <tbody className="divide-y divide-ink/10">
          {entries.map(([key, value]) => (
            <tr key={key}>
              <th className="w-1/3 bg-linen px-3 py-2 font-medium text-ink/70">{key}</th>
              <td className="px-3 py-2 text-ink/75">{formatResultValue(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EtraResultsTable({ results }: { results: Record<string, unknown> }) {
  const datos = getRecord(results.datos_generales);

  return (
    <div className="mt-3 space-y-3">
      <KeyValueGrid
        rows={[
          ["Vives con", datos.vives_con],
          ["Edad", datos.edad],
          ["Sexo", datos.sexo],
          ["Fecha", datos.fecha]
        ]}
      />
      <SimpleTable
        columns={["sub escala", "Puntuacion", "Corte", "R."]}
        rows={getRows(results.subescalas).map((row) => [
          row.sub_escala,
          row.puntuacion,
          row.corte,
          row.r
        ])}
      />
      <p className="text-sm font-semibold text-ink">Puntaje final: {formatResultValue(results.puntaje_final)}</p>
    </div>
  );
}

function BdiResultsTable({ results }: { results: Record<string, unknown> }) {
  return (
    <div className="mt-3 space-y-3">
      <SimpleTable
        columns={["Escalas", "P.", "Significativos"]}
        rows={getRows(results.escalas).map((row) => [row.escala, row.p, row.significativos])}
      />
      <SimpleTable
        columns={["Corte", "Significativos"]}
        rows={getRows(results.cortes).map((row) => [row.corte, row.significativos])}
      />
      <p className="text-sm font-semibold text-ink">TOTAL: {formatResultValue(results.total)}</p>
    </div>
  );
}

function YsqResultsTable({ results }: { results: Record<string, unknown> }) {
  const chartRows = getRows(results.grafica);

  return (
    <div className="mt-3 space-y-3">
      <SimpleTable
        columns={["ESQ", "PT", "# R 5 o 6", "Interpretacion"]}
        rows={getRows(results.esquemas).map((row) => [
          row.esq,
          row.pt,
          row.respuestas_5_6,
          row.interpretacion
        ])}
      />
      {chartRows.length > 0 ? <ResultsBarChart rows={chartRows} /> : null}
    </div>
  );
}

function PbqResultsTable({ results }: { results: Record<string, unknown> }) {
  return (
    <div className="mt-3 space-y-3">
      <SimpleTable
        columns={["Preg", "Trastorno", "Puntuacion", "#Resp 3 o 4", "Clasificacion"]}
        rows={getRows(results.resumen).map((row) => [
          row.preg,
          row.trastorno,
          row.puntuacion,
          row.respuestas_3_4,
          row.clasificacion
        ])}
      />
      <h4 className="text-xs font-semibold uppercase text-ink/50">Hombres</h4>
      <SimpleTable
        columns={["Trastorno", "Bajo", "Normal", "Alt"]}
        rows={getRows(results.hombres).map((row) => [row.trastorno, row.bajo, row.normal, row.alt])}
      />
      <h4 className="text-xs font-semibold uppercase text-ink/50">Mujeres</h4>
      <SimpleTable
        columns={["Trastorno", "Bajo", "Normal", "Alt"]}
        rows={getRows(results.mujeres).map((row) => [row.trastorno, row.bajo, row.normal, row.alt])}
      />
    </div>
  );
}

function KeyValueGrid({ rows }: { rows: Array<[string, unknown]> }) {
  return (
    <div className="grid gap-2 rounded-md border border-ink/10 p-3 text-xs md:grid-cols-2">
      {rows.map(([label, value]) => (
        <p key={label} className="text-ink/70">
          <span className="font-semibold text-ink">{label}:</span> {formatResultValue(value)}
        </p>
      ))}
    </div>
  );
}

function SimpleTable({ columns, rows }: { columns: string[]; rows: unknown[][] }) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-md border border-ink/10">
      <table className="w-full text-left text-xs">
        <thead className="bg-linen text-ink/70">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-3 py-2 font-semibold">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((value, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2 text-ink/75">
                  {formatResultValue(value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultsBarChart({ rows }: { rows: Record<string, unknown>[] }) {
  const values = rows.map((row) => Number(row.valor) || 0);
  const max = Math.max(...values, 1);

  return (
    <div className="rounded-md border border-ink/10 p-3">
      <p className="text-xs font-semibold uppercase text-ink/50">Grafica de resultados</p>
      <div className="mt-3 space-y-2">
        {rows.map((row) => {
          const value = Number(row.valor) || 0;
          const width = `${Math.max(4, (value / max) * 100)}%`;

          return (
            <div key={`${row.etiqueta}`} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-2 text-xs">
              <span className="truncate text-ink/65">{formatResultValue(row.etiqueta)}</span>
              <span className="h-2 rounded bg-enfasis/20">
                <span className="block h-2 rounded bg-azulMedio" style={{ width }} />
              </span>
              <span className="text-right text-ink/70">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function getRows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value)
    ? value.filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
    : [];
}

function formatResultValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }

  return `${value}`;
}
