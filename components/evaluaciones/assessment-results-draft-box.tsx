"use client";

import { useState } from "react";

type AssessmentResultsDraftBoxProps = {
  disabled?: boolean;
};

export function AssessmentResultsDraftBox({ disabled = false }: AssessmentResultsDraftBoxProps) {
  const [results, setResults] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h3 className="text-base font-semibold text-ink">Resultados</h3>
        <p className="mt-1 text-sm text-ink/65">
          Pega aqui los resultados de la prueba. La interpretacion automatica queda pendiente de
          decision tecnica.
        </p>
      </div>

      <textarea
        value={results}
        onChange={(event) => setResults(event.target.value)}
        rows={6}
        disabled={disabled}
        placeholder="Pega resultados, tablas o puntajes aqui."
        className="mt-4 w-full rounded-md border border-ink/15 px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20 disabled:cursor-not-allowed disabled:bg-ink/5"
      />

      <button
        type="button"
        disabled={disabled || results.trim().length === 0}
        onClick={() => setShowPreview(true)}
        className="mt-3 inline-flex h-10 items-center justify-center rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        Interpretar
      </button>

      {showPreview ? (
        <div className="mt-4 rounded-md border border-gold/30 bg-gold/10 p-3">
          <p className="text-xs font-semibold uppercase text-ink/50">Resultados de la prueba</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink/75">
            {results.trim() || "Sin resultados capturados."}
          </p>
          <p className="mt-3 text-xs text-ink/55">
            Interpretacion pendiente: aun no se ejecuta algoritmo ni GPT en esta accion.
          </p>
        </div>
      ) : null}
    </div>
  );
}
