import "server-only";

import { createHash } from "crypto";

export const STANDARD_CONSENT_TITLE =
  "Consentimiento informado estandar de atencion psicologica";

export const STANDARD_CONSENT_VERSION = "1.0";

export const STANDARD_CONSENT_PROCEDURE =
  "Aceptacion de consentimiento informado estandar";

export const STANDARD_CONSENT_METHOD =
  "Checkbox + boton Firmar y aceptar + codigo de firma de 4 digitos enviado por correo";

export const STANDARD_CONSENT_TEXT = [
  {
    title: "1. Naturaleza del servicio",
    body:
      "La atencion psicologica es un proceso profesional de evaluacion, orientacion e intervencion orientado al bienestar emocional, conductual y relacional. El proceso no sustituye servicios medicos, psiquiatricos, legales o de emergencia."
  },
  {
    title: "2. Participacion voluntaria",
    body:
      "La participacion es voluntaria. La persona puede hacer preguntas, solicitar aclaraciones, aceptar, rechazar o retirar su consentimiento, entendiendo que ello puede modificar la continuidad del servicio."
  },
  {
    title: "3. Confidencialidad y sus limites",
    body:
      "La informacion tratada sera manejada de forma confidencial y con medidas de seguridad. La confidencialidad puede limitarse cuando exista riesgo serio para la persona o terceros, requerimiento de autoridad competente, situaciones de violencia, abuso, negligencia, o condiciones previstas por la normatividad aplicable."
  },
  {
    title: "4. Expediente clinico y tratamiento de datos",
    body:
      "El profesional registrara informacion necesaria para integrar y conservar el expediente clinico. Los datos se usan para la prestacion del servicio, seguimiento clinico, obligaciones legales, auditoria y seguridad de la plataforma."
  },
  {
    title: "5. Riesgos, beneficios y alcances",
    body:
      "El proceso puede generar beneficios como mayor comprension personal y estrategias de afrontamiento. Tambien puede implicar incomodidad emocional al abordar temas sensibles. No se garantiza un resultado especifico."
  },
  {
    title: "6. Modalidad y comunicacion",
    body:
      "Las sesiones pueden realizarse en modalidad presencial o remota segun lo acordado con el profesional. La plataforma puede enviar avisos operativos o legales relacionados con la atencion."
  },
  {
    title: "7. Aceptacion",
    body:
      "Al firmar y validar el codigo enviado por correo, la persona declara que leyo el consentimiento, entiende sus alcances, tuvo oportunidad de resolver dudas y acepta iniciar o continuar la atencion psicologica."
  }
];

export function standardConsentPlainText() {
  return STANDARD_CONSENT_TEXT.map((section) => `${section.title}\n${section.body}`).join("\n\n");
}

export function standardConsentHash() {
  return createHash("sha256")
    .update(
      JSON.stringify({
        title: STANDARD_CONSENT_TITLE,
        version: STANDARD_CONSENT_VERSION,
        text: STANDARD_CONSENT_TEXT
      })
    )
    .digest("hex");
}
