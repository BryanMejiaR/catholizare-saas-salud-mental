"use client";

import { useActionState } from "react";

import { acceptProfessionalExportResponsibilityAction } from "@/app/data-export/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { PhoneInput } from "@/components/forms/phone-input";

type ExportAcceptanceFormProps = {
  token: string;
  defaultFullName: string;
  defaultEmail: string;
};

const initialState = {
  message: "",
  ok: false
};

export function ExportAcceptanceForm({
  token,
  defaultFullName,
  defaultEmail
}: ExportAcceptanceFormProps) {
  const [state, formAction] = useActionState(
    acceptProfessionalExportResponsibilityAction,
    initialState
  );

  return (
    <form action={formAction} className="rounded-lg border border-ink/10 bg-white p-5">
      <input type="hidden" name="token" value={token} />
      <h2 className="text-lg font-semibold text-ink">Firmar responsabilidad de descarga</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        Al firmar, aceptas que eres responsable de la custodia, resguardo y tratamiento de los
        expedientes descargados. El codigo de firma de 6 digitos queda pendiente para el MVP.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Nombre completo
          <input
            name="fullName"
            defaultValue={defaultFullName}
            minLength={3}
            maxLength={180}
            required
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Correo electronico
          <input
            name="email"
            type="email"
            defaultValue={defaultEmail}
            maxLength={180}
            required
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </label>
        <PhoneInput name="phone" label="Telefono" required />
        <label className="text-sm font-medium text-ink">
          RFC
          <input
            name="rfc"
            minLength={10}
            maxLength={20}
            required
            className="mt-2 w-full rounded-md border border-ink/15 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="mt-4 flex gap-3 rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-ink">
        <input name="responsibilityAccepted" type="checkbox" required className="mt-1" />
        <span>
          Confirmo que soy responsable del expediente descargado y que debo protegerlo conforme a
          las obligaciones legales, clinicas y de confidencialidad aplicables.
        </span>
      </label>

      <div className="mt-4">
        <SubmitButton>Firmar y aceptar</SubmitButton>
      </div>
      {state.message ? (
        <p className={`mt-3 text-sm ${state.ok ? "text-moss" : "text-clay"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
