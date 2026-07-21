import "server-only";

import { getServerEnv } from "@/lib/env";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
};

type SendEmailResult =
  | {
      ok: true;
      id?: string;
    }
  | {
      ok: false;
      code: "missing_config" | "resend_rejected" | "network_error";
      error: string;
      status?: number;
    };

function parseResendError(body: string) {
  try {
    const parsed = JSON.parse(body) as { message?: string; name?: string; error?: string };
    return parsed.message ?? parsed.error ?? parsed.name ?? body;
  } catch {
    return body;
  }
}

function parseResendSuccess(body: string) {
  try {
    const parsed = JSON.parse(body) as { id?: string };
    return parsed.id;
  } catch {
    return undefined;
  }
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  const env = getServerEnv();

  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL) {
    return {
      ok: false,
      code: "missing_config",
      error: "Resend no esta configurado."
    } satisfies SendEmailResult;
  }

  let response: Response;

  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL,
        to,
        subject,
        html,
        text
      })
    });
  } catch (error) {
    return {
      ok: false,
      code: "network_error",
      error: error instanceof Error ? error.message : "No fue posible conectar con Resend."
    } satisfies SendEmailResult;
  }

  const body = await response.text();

  if (!response.ok) {
    return {
      ok: false,
      code: "resend_rejected",
      status: response.status,
      error: parseResendError(body)
    } satisfies SendEmailResult;
  }

  return { ok: true, id: parseResendSuccess(body) } satisfies SendEmailResult;
}
