"use client";

import { useActionState } from "react";

import { updateHistoriaClinicaAction } from "@/app/expedientes/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { ActionMessage } from "@/components/users/action-message";
import type { ExpedienteDetail } from "@/lib/expedientes/types";

type HistoriaClinicaFormProps = {
  expediente: ExpedienteDetail;
  disabled?: boolean;
};

const fields = [
  ["motivoConsulta", "Motivo de consulta"],
  ["historiaProblemaActual", "Historia del problema actual"],
  ["antecedentesPsicologicos", "Antecedentes psicologicos"],
  ["antecedentesPsiquiatricos", "Antecedentes psiquiatricos"],
  ["antecedentesMedicos", "Antecedentes medicos relevantes"],
  ["antecedentesFamiliares", "Antecedentes familiares relevantes"],
  ["antecedentesTratamiento", "Antecedentes de tratamiento"],
  ["antecedentesMedicacion", "Antecedentes de medicacion"],
  ["contextoFamiliar", "Contexto familiar"],
  ["contextoRelacional", "Contexto relacional"],
  ["contextoLaboralAcademico", "Contexto laboral o academico"],
  ["contextoEspiritualReligioso", "Contexto espiritual o religioso"],
  ["factoresRiesgo", "Factores de riesgo"],
  ["factoresProtectores", "Factores protectores"],
  ["recursosPersonales", "Recursos personales"],
  ["observacionesClinicasIniciales", "Observaciones clinicas iniciales"]
] as const;

const valueByField = {
  motivoConsulta: "motivo_consulta",
  historiaProblemaActual: "historia_problema_actual",
  antecedentesPsicologicos: "antecedentes_psicologicos",
  antecedentesPsiquiatricos: "antecedentes_psiquiatricos",
  antecedentesMedicos: "antecedentes_medicos",
  antecedentesFamiliares: "antecedentes_familiares",
  antecedentesTratamiento: "antecedentes_tratamiento",
  antecedentesMedicacion: "antecedentes_medicacion",
  contextoFamiliar: "contexto_familiar",
  contextoRelacional: "contexto_relacional",
  contextoLaboralAcademico: "contexto_laboral_academico",
  contextoEspiritualReligioso: "contexto_espiritual_religioso",
  factoresRiesgo: "factores_riesgo",
  factoresProtectores: "factores_protectores",
  recursosPersonales: "recursos_personales",
  observacionesClinicasIniciales: "observaciones_clinicas_iniciales"
} as const;

export function HistoriaClinicaForm({ expediente, disabled = false }: HistoriaClinicaFormProps) {
  const [state, formAction] = useActionState(updateHistoriaClinicaAction, {});
  const historia = expediente.historia_clinica;

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <input type="hidden" name="expedienteId" value={expediente.id} />
      <div>
        <h2 className="text-lg font-semibold text-ink">Historia clinica psicologica</h2>
        <p className="mt-1 text-sm text-ink/65">
          Contenido clinico protegido. No se comparte con Administrador ni Super Administrador.
        </p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(([name, label]) => (
          <label key={name} className="block">
            <span className="text-sm font-medium text-ink">{label}</span>
            <textarea
              name={name}
              rows={4}
              disabled={disabled}
              defaultValue={historia?.[valueByField[name]] ?? ""}
              className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
            />
          </label>
        ))}
      </div>

      <SubmitButton disabled={disabled}>Guardar nueva version</SubmitButton>
      <p className="text-xs text-ink/50">
        Cada guardado crea una nueva version del registro. Las versiones anteriores se conservan.
      </p>
    </form>
  );
}
