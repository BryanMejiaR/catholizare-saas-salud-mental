"use client";

import { useActionState, useState } from "react";

import {
  acceptStandardConsentAction,
  requestStandardConsentCodeAction
} from "@/app/portal/actions";
import { SubmitButton } from "@/components/auth/submit-button";
import { PhoneInput } from "@/components/forms/phone-input";
import { ActionMessage } from "@/components/users/action-message";
import type { PortalStandardConsent } from "@/lib/portal/types";

type StandardConsentPanelProps = {
  consents: PortalStandardConsent[];
};

function ConsentItem({ consent }: { consent: PortalStandardConsent }) {
  const [codeState, codeAction] = useActionState(requestStandardConsentCodeAction, {});
  const [acceptState, acceptAction] = useActionState(acceptStandardConsentAction, {});
  const [codeRequested, setCodeRequested] = useState(false);

  return (
    <article className="rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">{consent.title}</h2>
        <p className="mt-1 text-sm text-ink/60">
          Version {consent.version} - Profesional: {consent.professional.full_name}
        </p>
      </div>

      <div className="mt-4 max-h-80 space-y-4 overflow-y-auto rounded-md border border-ink/10 bg-linen p-4">
        {consent.document_text.map((section) => (
          <section key={section.title}>
            <h3 className="text-sm font-semibold text-ink">{section.title}</h3>
            <p className="mt-1 text-sm leading-6 text-ink/75">{section.body}</p>
          </section>
        ))}
      </div>

      <form
        action={async (formData) => {
          await codeAction(formData);
          setCodeRequested(true);
        }}
        className="mt-4 space-y-3"
      >
        <input type="hidden" name="consentimientoId" value={consent.id} />
        <ActionMessage message={codeState.message} ok={codeState.ok} />
        <SubmitButton>Enviar codigo de 4 digitos a mi correo</SubmitButton>
      </form>

      {codeRequested || codeState.ok ? (
        <form action={acceptAction} className="mt-4 space-y-4 rounded-md border border-ink/10 p-4">
          <input type="hidden" name="consentimientoId" value={consent.id} />
          <ActionMessage message={acceptState.message} ok={acceptState.ok} />

          <label className="block">
            <span className="text-sm font-medium text-ink">Codigo de 4 digitos</span>
            <input
              name="code"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              required
              className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <PhoneInput name="acceptanceActorPhone" label="Telefono" required />
            <label className="block">
              <span className="text-sm font-medium text-ink">RFC</span>
              <input
                name="acceptanceActorRfc"
                required
                minLength={10}
                maxLength={20}
                className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 uppercase outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
              />
            </label>
          </div>

          <label className="flex gap-3 rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-ink">
            <input name="legalAcceptance" type="checkbox" required className="mt-1" />
            <span>
              Declaro que lei y acepto el consentimiento informado estandar. Entiendo que esta
              aceptacion se registrara con folio, fecha, IP, referencia de sesion y hash del
              documento.
            </span>
          </label>

          <SubmitButton>Firmar y aceptar consentimiento</SubmitButton>
        </form>
      ) : null}
    </article>
  );
}

export function StandardConsentPanel({ consents }: StandardConsentPanelProps) {
  if (consents.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      {consents.map((consent) => (
        <ConsentItem key={consent.id} consent={consent} />
      ))}
    </section>
  );
}
