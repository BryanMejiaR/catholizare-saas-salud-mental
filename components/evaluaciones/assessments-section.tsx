import { AssessmentAiDraftForm } from "@/components/evaluaciones/assessment-ai-draft-form";
import { CreateAssessmentForm } from "@/components/evaluaciones/create-assessment-form";
import { ValidateAssessmentForm } from "@/components/evaluaciones/validate-assessment-form";
import type { PsychologicalAssessment } from "@/lib/evaluaciones/types";

type AssessmentsSectionProps = {
  expedienteId: string;
  assessments: PsychologicalAssessment[];
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
