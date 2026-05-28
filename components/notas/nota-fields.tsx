import type { NotaClinica } from "@/lib/notas/types";

type NotaFieldsProps = {
  note?: NotaClinica;
  disabled?: boolean;
};

const textAreas = [
  ["content", "Contenido clinico", true],
  ["clinicalSummary", "Resumen clinico", false],
  ["interventions", "Intervenciones realizadas", false],
  ["patientResponse", "Respuesta del Paciente", false],
  ["planNextSession", "Plan para siguiente sesion", false],
  ["riskFlags", "Riesgos o alertas", false],
  ["homeworkOrTasks", "Tareas o acuerdos", false]
] as const;

const scores = [
  ["moodScore", "Animo"],
  ["anxietyScore", "Ansiedad"],
  ["hopeScore", "Esperanza"]
] as const;

const valueByField = {
  content: "content",
  clinicalSummary: "clinical_summary",
  interventions: "interventions",
  patientResponse: "patient_response",
  planNextSession: "plan_next_session",
  riskFlags: "risk_flags",
  homeworkOrTasks: "homework_or_tasks",
  moodScore: "mood_score",
  anxietyScore: "anxiety_score",
  hopeScore: "hope_score"
} as const;

export function NotaFields({ note, disabled = false }: NotaFieldsProps) {
  return (
    <>
      <label className="block">
        <span className="text-sm font-medium text-ink">Fecha de sesion</span>
        <input
          type="date"
          name="sessionDate"
          disabled={disabled}
          required
          defaultValue={note?.session_date ?? new Date().toISOString().slice(0, 10)}
          className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        {textAreas.map(([name, label, required]) => (
          <label key={name} className={name === "content" ? "block md:col-span-2" : "block"}>
            <span className="text-sm font-medium text-ink">{label}</span>
            <textarea
              name={name}
              rows={name === "content" ? 6 : 4}
              disabled={disabled}
              required={required}
              defaultValue={note?.[valueByField[name]] ?? ""}
              className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
            />
          </label>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {scores.map(([name, label]) => (
          <label key={name} className="block">
            <span className="text-sm font-medium text-ink">{label} 1-10</span>
            <input
              type="number"
              name={name}
              min={1}
              max={10}
              disabled={disabled}
              defaultValue={note?.[valueByField[name]] ?? ""}
              className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
            />
          </label>
        ))}
      </div>
    </>
  );
}
