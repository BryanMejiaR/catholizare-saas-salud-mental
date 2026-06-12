import {
  DEFAULT_NOTA_TEMPLATE_SECTIONS,
  type NotaClinica,
  type NotaTemplateField,
  type NotaTemplateSection
} from "@/lib/notas/types";

type NotaFieldsProps = {
  note?: NotaClinica;
  sections?: NotaTemplateSection[];
  values?: Record<string, Record<string, string | number | boolean | null>> | null;
  disabled?: boolean;
};

const scores = [
  ["mood_score", "Animo 1-10"],
  ["anxiety_score", "Ansiedad 1-10"],
  ["hope_score", "Esperanza 1-10"]
] as const;

function legacyValue(note: NotaClinica | undefined, fieldId: string) {
  if (!note) {
    return "";
  }

  const legacyValues: Record<string, string | number | null | undefined> = {
    session_date: note.session_date,
    session_time: note.session_time?.slice(0, 5),
    tcc_session_number: note.tcc_session_number,
    objective_scores: note.objective_scores,
    patient_plan: note.patient_plan,
    therapist_objectives: note.therapist_objectives,
    mood_review: note.mood_review,
    previous_session_bridge: note.previous_session_bridge,
    session_agenda: note.session_agenda,
    action_plan_review: note.action_plan_review,
    key_session_points: note.key_session_points,
    session_summary_feedback: note.session_summary_feedback,
    home_action_plan: note.home_action_plan,
    patient_feedback: note.patient_feedback,
    observations: note.observations,
    next_session_at: note.next_session_at?.slice(0, 10),
    risk_flags: note.risk_flags
  };

  return legacyValues[fieldId] ?? "";
}

function fieldValue(
  note: NotaClinica | undefined,
  values: NotaFieldsProps["values"],
  sectionId: string,
  fieldId: string
) {
  const value = values?.[sectionId]?.[fieldId];
  return value ?? legacyValue(note, fieldId);
}

function FieldInput({
  field,
  name,
  value,
  disabled
}: {
  field: NotaTemplateField;
  name: string;
  value: string | number | boolean | null | undefined;
  disabled: boolean;
}) {
  const baseClass =
    "mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20";

  if (field.type === "textarea") {
    return (
      <textarea
        name={name}
        rows={4}
        disabled={disabled}
        required={field.required}
        defaultValue={typeof value === "string" || typeof value === "number" ? String(value) : ""}
        className={baseClass}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        name={name}
        disabled={disabled}
        required={field.required}
        defaultValue={String(value ?? "")}
        className={baseClass}
      >
        <option value="">Seleccionar</option>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type}
      name={name}
      disabled={disabled}
      required={field.required}
      defaultValue={String(value ?? "")}
      className={baseClass}
    />
  );
}

export function NotaFields({
  note,
  sections,
  values,
  disabled = false
}: NotaFieldsProps) {
  const templateSections =
    sections ?? note?.note_template_snapshot?.sections ?? DEFAULT_NOTA_TEMPLATE_SECTIONS;
  const templateValues = values ?? note?.note_template_values ?? {};

  return (
    <>
      {templateSections.map((section) => (
        <section key={section.id} className="space-y-4 rounded-md border border-ink/10 bg-ink/[0.02] p-4">
          <div>
            <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
            {section.description ? (
              <p className="mt-1 text-xs text-ink/60">{section.description}</p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {section.fields.map((field) => (
              <label
                key={field.id}
                className={field.type === "textarea" ? "block md:col-span-2" : "block"}
              >
                <span className="text-sm font-medium text-ink">{field.label}</span>
                <FieldInput
                  field={field}
                  name={`field_${section.id}_${field.id}`}
                  value={fieldValue(note, templateValues, section.id, field.id)}
                  disabled={disabled}
                />
              </label>
            ))}
          </div>
        </section>
      ))}

      <div className="grid gap-4 md:grid-cols-3">
        {scores.map(([name, label]) => (
          <label key={name} className="block">
            <span className="text-sm font-medium text-ink">{label}</span>
            <input
              type="number"
              min={1}
              max={10}
              name={name}
              disabled={disabled}
              defaultValue={note?.[name] ?? ""}
              className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
            />
          </label>
        ))}
      </div>
    </>
  );
}
