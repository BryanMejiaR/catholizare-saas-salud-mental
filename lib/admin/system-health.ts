import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type SystemHealthCheck = {
  label: string;
  status: "ok" | "warning" | "error";
  detail: string;
};

async function countTable(table: string): Promise<SystemHealthCheck> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { count, error } = await supabaseAdmin.from(table).select("id", {
    count: "exact",
    head: true
  });

  if (error) {
    return {
      label: `Tabla ${table}`,
      status: "error",
      detail: error.message
    };
  }

  return {
    label: `Tabla ${table}`,
    status: "ok",
    detail: `${count ?? 0} registros accesibles por service role`
  };
}

async function checkBucket(bucket: string): Promise<SystemHealthCheck> {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.storage.from(bucket).list("", { limit: 1 });

  if (error) {
    return {
      label: `Bucket ${bucket}`,
      status: "warning",
      detail: error.message
    };
  }

  return {
    label: `Bucket ${bucket}`,
    status: "ok",
    detail: `${data.length} elemento(s) en prueba de listado`
  };
}

export async function getSystemHealthChecks(): Promise<SystemHealthCheck[]> {
  const envChecks: SystemHealthCheck[] = [
    {
      label: "Supabase URL",
      status: process.env.NEXT_PUBLIC_SUPABASE_URL ? "ok" : "error",
      detail: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configurada" : "Falta NEXT_PUBLIC_SUPABASE_URL"
    },
    {
      label: "Service role",
      status: process.env.SUPABASE_SERVICE_ROLE_KEY ? "ok" : "error",
      detail: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configurada en servidor" : "Falta SUPABASE_SERVICE_ROLE_KEY"
    },
    {
      label: "Sentry",
      status: process.env.SENTRY_DSN ? "ok" : "warning",
      detail: process.env.SENTRY_DSN ? "DSN configurado" : "Sin SENTRY_DSN"
    },
    {
      label: "OAuth integrations",
      status:
        process.env.GOOGLE_CLIENT_ID && process.env.ZOOM_CLIENT_ID && process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY
          ? "ok"
          : "warning",
      detail: "Google, Zoom y clave de cifrado revisadas por presencia de variables"
    },
    {
      label: "Email transaccional",
      status: process.env.RESEND_API_KEY ? "ok" : "warning",
      detail: process.env.RESEND_API_KEY ? "Resend configurado" : "Sin RESEND_API_KEY"
    }
  ];

  const tableChecks = await Promise.all([
    countTable("profiles"),
    countTable("expedientes"),
    countTable("notas_clinicas"),
    countTable("audit_logs"),
    countTable("pro_resources"),
    countTable("patient_resources")
  ]);
  const bucketChecks = await Promise.all([
    checkBucket("clinical-consents"),
    checkBucket("assessment-submissions"),
    checkBucket("announcement-assets")
  ]);

  return [...envChecks, ...tableChecks, ...bucketChecks];
}
