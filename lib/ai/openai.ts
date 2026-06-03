import "server-only";

import { getServerEnv } from "@/lib/env";
import type { AiDraftResult, ClinicalContextPackage } from "@/lib/ai/types";

type ResponsesApiResult = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

function extractResponseText(result: ResponsesApiResult) {
  if (typeof result.output_text === "string" && result.output_text.trim().length > 0) {
    return result.output_text.trim();
  }

  return (
    result.output
      ?.flatMap((item) => item.content ?? [])
      .map((content) => content.text)
      .filter((text): text is string => typeof text === "string" && text.trim().length > 0)
      .join("\n\n")
      .trim() ?? ""
  );
}

export async function generateClinicalDraft({
  contextPackage,
  directives
}: {
  contextPackage: ClinicalContextPackage;
  directives: string;
}): Promise<AiDraftResult> {
  const env = getServerEnv();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  if (!env.OPENAI_API_KEY) {
    clearTimeout(timeoutId);
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    signal: controller.signal,
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content:
            "Eres un asistente clinico para profesionales de salud mental. Genera solo borradores supervisados. No emitas diagnosticos definitivos, no inventes datos, diferencia hechos de hipotesis, evita lenguaje moralizante y senala informacion faltante. No incluyas datos identificables del paciente."
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              instructions:
                "Prepara una sugerencia clinica estructurada para el Profesional. El contenido no se guardara automaticamente y debe poder editarse antes de incorporarse al expediente o proceso.",
              professional_directives: directives,
              clinical_context_package: contextPackage
            },
            null,
            2
          )
        }
      ]
    })
  }).finally(() => {
    clearTimeout(timeoutId);
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI response failed: ${response.status} ${errorText.slice(0, 300)}`);
  }

  const result = (await response.json()) as ResponsesApiResult;
  const content = extractResponseText(result);

  if (!content) {
    throw new Error("OpenAI response did not include text output");
  }

  return {
    model: env.OPENAI_MODEL,
    content
  };
}
