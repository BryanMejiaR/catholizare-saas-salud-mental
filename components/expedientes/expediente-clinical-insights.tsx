import type { ExpedienteNotaMetric } from "@/lib/notas/types";
import type { ProcesoTerapeutico } from "@/lib/procesos/types";

type ExpedienteClinicalInsightsProps = {
  notes: ExpedienteNotaMetric[];
  process: ProcesoTerapeutico | null;
};

const moodScale = [
  { value: -5, label: "-5", description: "Muy bajo" },
  { value: -3, label: "-3", description: "Bajo" },
  { value: 0, label: "0", description: "Neutro" },
  { value: 3, label: "+3", description: "Estable" },
  { value: 5, label: "+5", description: "Muy positivo" }
];

function getTemplateValue(
  values: ExpedienteNotaMetric["note_template_values"],
  fieldId: string
) {
  if (!values) {
    return null;
  }

  for (const sectionValues of Object.values(values)) {
    const value = sectionValues?.[fieldId];

    if (value !== undefined && value !== null && String(value).trim().length > 0) {
      return String(value);
    }
  }

  return null;
}

function parseMood(note: ExpedienteNotaMetric) {
  const raw = note.mood_review ?? getTemplateValue(note.note_template_values, "mood_review");
  const value = Number(raw);

  if (!Number.isFinite(value) || value < -5 || value > 5) {
    return null;
  }

  return value;
}

function getTechniques(notes: ExpedienteNotaMetric[]) {
  return [
    ...new Set(
      notes
        .map((note) => getTemplateValue(note.note_template_values, "follow_up_techniques"))
        .filter((value): value is string => Boolean(value))
        .flatMap((value) =>
          value
            .split(/\n|,/)
            .map((item) => item.trim())
            .filter(Boolean)
        )
    )
  ].slice(0, 12);
}

function getTccProgress(process: ProcesoTerapeutico) {
  const steps = process.template_snapshot?.steps ?? [];
  const currentStep =
    steps.find((step) => process.step_data?.[step.id]?.completed !== true) ?? steps.at(-1);
  const completedCount = steps.filter((step) => process.step_data?.[step.id]?.completed === true).length;

  return {
    currentStage: currentStep?.title ?? "Sin etapa configurada",
    completedCount,
    totalCount: steps.length
  };
}

const tccMapStages = [
  {
    id: "pre-evaluacion",
    range: "Sesion 0",
    title: "Pre-evaluacion",
    summary: "Consentimiento informado, historia de vida y preparacion del caso."
  },
  {
    id: "evaluacion-inicial",
    range: "Sesiones 1-2",
    title: "Evaluacion y conceptualizacion",
    summary: "Entrevista inicial, analisis de historia de vida, DSM/CIE y plan de tratamiento."
  },
  {
    id: "intervencion-inicial",
    range: "Sesiones 3-7",
    title: "Intervencion inicial",
    summary: "Notas de sesion, plan actual, indicadores y grafica de estado de animo."
  },
  {
    id: "segunda-evaluacion",
    range: "Sesion 8",
    title: "Segundo corte de evaluacion",
    summary: "Reaplicacion de tests, nuevos resultados y ajuste de conceptualizacion."
  },
  {
    id: "intervencion-media",
    range: "Sesiones 9-17",
    title: "Intervencion y seguimiento",
    summary: "Seguimiento de indicadores, notas de sesion y revision del estado de animo."
  },
  {
    id: "tercera-evaluacion",
    range: "Sesion 18",
    title: "Tercer corte de evaluacion",
    summary: "Nueva aplicacion de tests, analisis actualizado y decision de continuidad."
  },
  {
    id: "alta",
    range: "Sesion 19+",
    title: "Alta opcional",
    summary: "Cierre clinico o plan de mantenimiento segun evolucion del paciente."
  }
];

function getTccStageIndex(sessionCount: number) {
  if (sessionCount <= 0) {
    return 0;
  }

  if (sessionCount <= 2) {
    return 1;
  }

  if (sessionCount <= 7) {
    return 2;
  }

  if (sessionCount === 8) {
    return 3;
  }

  if (sessionCount <= 17) {
    return 4;
  }

  if (sessionCount === 18) {
    return 5;
  }

  return 6;
}

function getNextTccEvaluation(sessionCount: number) {
  if (sessionCount < 8) {
    return "Sesion 8: segundo corte de evaluacion";
  }

  if (sessionCount < 18) {
    return "Sesion 18: tercer corte de evaluacion";
  }

  return "Alta opcional o plan de mantenimiento";
}

function MoodChart({ notes }: { notes: ExpedienteNotaMetric[] }) {
  const points = notes
    .map((note, index) => ({
      id: note.id,
      label: note.session_date,
      session: note.tcc_session_number ?? index + 1,
      value: parseMood(note)
    }))
    .filter((point): point is { id: string; label: string; session: number; value: number } => point.value !== null);

  if (points.length === 0) {
    return (
      <p className="rounded-md border border-ink/10 bg-linen px-3 py-2 text-sm text-ink/60">
        Aun no hay valores de estado de animo registrados.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {points.map((point) => {
          const width = `${((point.value + 5) / 10) * 100}%`;

          return (
            <div key={point.id} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2 text-xs">
              <span className="text-ink/60">S{point.session}</span>
              <span className="relative h-3 rounded-full bg-ink/10">
                <span className="absolute left-1/2 top-[-2px] h-5 w-px bg-ink/25" />
                <span className="block h-3 rounded-full bg-moss" style={{ width }} />
              </span>
              <span className="text-right font-semibold text-ink">{point.value > 0 ? `+${point.value}` : point.value}</span>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-5 gap-1 text-center text-[11px] text-ink/55">
        {moodScale.map((item) => (
          <span key={item.value}>
            <strong className="block text-ink">{item.label}</strong>
            {item.description}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ExpedienteClinicalInsights({ notes, process }: ExpedienteClinicalInsightsProps) {
  const sessionNotes = notes.filter((note) => note.note_type === "sesion");
  const techniques = getTechniques(sessionNotes);
  const tccProgress = process?.model_type === "tcc" ? getTccProgress(process) : null;
  const tccStageIndex = getTccStageIndex(sessionNotes.length);
  const nextCaseReviewSession = Math.max(8, Math.ceil((sessionNotes.length + 1) / 8) * 8);

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-ink/10 bg-white p-4">
        <p className="text-sm text-ink/60">Numero de sesiones</p>
        <p className="mt-2 text-3xl font-semibold text-ink">{sessionNotes.length}</p>
      </div>

      <div className="rounded-lg border border-ink/10 bg-white p-4">
        <p className="text-sm font-semibold text-ink">Tecnicas aplicadas</p>
        {techniques.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {techniques.map((technique) => (
              <span key={technique} className="rounded-full bg-moss/10 px-3 py-1 text-xs font-medium text-moss">
                {technique}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink/60">Sin tecnicas registradas en notas de sesion.</p>
        )}
      </div>

      <div className="rounded-lg border border-ink/10 bg-white p-4">
        <p className="text-sm font-semibold text-ink">Grafica de estado de animo</p>
        <p className="mt-1 text-xs text-ink/55">
          Escala clinica de -5 a +5 capturada en la fase inicial de cada nota.
        </p>
        <div className="mt-4">
          <MoodChart notes={sessionNotes} />
        </div>
      </div>

      {tccProgress ? (
        <div className="rounded-lg border border-ink/10 bg-white p-4 lg:col-span-2">
          <p className="text-sm font-semibold text-ink">Mapa de progreso TCC</p>
          <p className="mt-1 text-xs text-ink/55">
            Basado en el flujo TCC de entrevista inicial, cortes de evaluacion y alta opcional.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-7">
            {tccMapStages.map((stage, index) => {
              const isCurrent = index === tccStageIndex;
              const isComplete = index < tccStageIndex;

              return (
                <div
                  key={stage.id}
                  className={[
                    "rounded-md border p-3 text-xs",
                    isCurrent
                      ? "border-moss bg-moss/10 text-ink"
                      : isComplete
                        ? "border-moss/20 bg-moss/5 text-ink/70"
                        : "border-ink/10 bg-linen text-ink/60"
                  ].join(" ")}
                >
                  <p className="font-semibold text-ink">{stage.range}</p>
                  <p className="mt-1 font-medium">{stage.title}</p>
                  <p className="mt-2 leading-5">{stage.summary}</p>
                </div>
              );
            })}
          </div>
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <div>
              <dt className="font-medium text-ink/60">Etapa actual del tratamiento</dt>
              <dd className="mt-1 text-ink">
                {tccMapStages[tccStageIndex]?.title ?? tccProgress.currentStage}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink/60">Siguiente evaluacion del paciente</dt>
              <dd className="mt-1 text-ink">{getNextTccEvaluation(sessionNotes.length)}</dd>
            </div>
            <div>
              <dt className="font-medium text-ink/60">Siguiente revision del caso</dt>
              <dd className="mt-1 text-ink">
                Sesion {nextCaseReviewSession} (cada 8 sesiones)
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-ink/55">
            Avance del proceso: {tccProgress.completedCount}/{tccProgress.totalCount} etapas completadas.
          </p>
        </div>
      ) : null}
    </section>
  );
}
