"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

import { getCurrentProfile } from "@/lib/auth/profile";
import { safeWriteAuditLog } from "@/lib/audit/safe";
import { NOTA_CLINICA_TYPES } from "@/lib/notas/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type NotaActionState = {
  message?: string;
  ok?: boolean;
};

type ExpedienteAccess = {
  id: string;
  patient_id: string;
  professional_id: string;
  status: string;
  consent_status: string;
};

type NotaAccess = {
  id: string;
  expediente_id: string;
  patient_id: string;
  professional_id: string;
  created_by_user_id: string | null;
  status: string;
  note_type: string;
};

const allowedConsentStatuses = new Set([
  "firmado_fisico",
  "firmado_digital",
  "excepcion_justificada"
]);

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length > 0 ? value : null));

const optionalScore = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().int().min(1).max(10).optional()
);

const noteBodySchema = {
  sessionDate: z.string().trim().min(1, "Selecciona la fecha de la sesion."),
  content: z.string().trim().min(10, "Describe el contenido clinico de la nota."),
  clinicalSummary: optionalText,
  interventions: optionalText,
  patientResponse: optionalText,
  planNextSession: optionalText,
  riskFlags: optionalText,
  homeworkOrTasks: optionalText,
  moodScore: optionalScore,
  anxietyScore: optionalScore,
  hopeScore: optionalScore
};

const createNotaSchema = z.object({
  expedienteId: z.string().uuid(),
  noteType: z.enum(NOTA_CLINICA_TYPES),
  ...noteBodySchema
});

const updateDraftSchema = z.object({
  noteId: z.string().uuid(),
  ...noteBodySchema
});

const noteIdSchema = z.object({
  noteId: z.string().uuid()
});

const addendumSchema = z.object({
  noteId: z.string().uuid(),
  correctionReason: z.string().trim().min(5, "Describe el motivo de la correccion."),
  content: z.string().trim().min(10, "Describe la correccion o aclaracion clinica.")
});

const annulSchema = z.object({
  noteId: z.string().uuid(),
  annulmentReason: z.string().trim().min(5, "Describe el motivo de la anulacion logica.")
});

async function getActiveProfessional() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "profesional" || profile.account_status !== "activo") {
    return null;
  }

  return profile;
}

async function assertExpedienteOwner(expedienteId: string, professionalId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("expedientes")
    .select("id, patient_id, professional_id, status, consent_status")
    .eq("id", expedienteId)
    .eq("professional_id", professionalId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as ExpedienteAccess;
}

async function assertNotaOwner(noteId: string, professionalId: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("notas_clinicas")
    .select("id, expediente_id, patient_id, professional_id, created_by_user_id, status, note_type")
    .eq("id", noteId)
    .eq("professional_id", professionalId)
    .single();

  if (error || !data) {
    return null;
  }

  return data as NotaAccess;
}

function parseNoteBody(formData: FormData) {
  return {
    sessionDate: formData.get("sessionDate"),
    content: formData.get("content"),
    clinicalSummary: formData.get("clinicalSummary"),
    interventions: formData.get("interventions"),
    patientResponse: formData.get("patientResponse"),
    planNextSession: formData.get("planNextSession"),
    riskFlags: formData.get("riskFlags"),
    homeworkOrTasks: formData.get("homeworkOrTasks"),
    moodScore: formData.get("moodScore"),
    anxietyScore: formData.get("anxietyScore"),
    hopeScore: formData.get("hopeScore")
  };
}

function noteBodyPayload(data: z.infer<typeof createNotaSchema> | z.infer<typeof updateDraftSchema>) {
  return {
    session_date: data.sessionDate,
    content: data.content,
    clinical_summary: data.clinicalSummary,
    interventions: data.interventions,
    patient_response: data.patientResponse,
    plan_next_session: data.planNextSession,
    risk_flags: data.riskFlags,
    homework_or_tasks: data.homeworkOrTasks,
    mood_score: data.moodScore ?? null,
    anxiety_score: data.anxietyScore ?? null,
    hope_score: data.hopeScore ?? null
  };
}

export async function createNotaClinicaAction(
  _previousState: NotaActionState,
  formData: FormData
): Promise<NotaActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = createNotaSchema.safeParse({
    expedienteId: formData.get("expedienteId"),
    noteType: formData.get("noteType"),
    ...parseNoteBody(formData)
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos invalidos.", ok: false };
  }

  if (parsed.data.noteType === "addendum") {
    return { message: "Los addendums se crean desde la nota original.", ok: false };
  }

  const expediente = await assertExpedienteOwner(parsed.data.expedienteId, actor.id);

  if (!expediente) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_create",
      entityType: "notas_clinicas",
      entityId: parsed.data.expedienteId,
      result: "denied",
      context: "audit_nota_clinica_create_denied"
    });

    return { message: "No tienes permiso para crear notas en este expediente.", ok: false };
  }

  if (expediente.status !== "activo") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_create",
      entityType: "notas_clinicas",
      entityId: expediente.id,
      result: "denied",
      context: "audit_nota_clinica_create_denied_not_active"
    });

    return { message: "El expediente no esta activo y no puede modificarse.", ok: false };
  }

  if (!allowedConsentStatuses.has(expediente.consent_status)) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_create",
      entityType: "notas_clinicas",
      entityId: expediente.id,
      result: "denied",
      metadata: {
        consent_status: expediente.consent_status
      },
      context: "audit_nota_clinica_create_denied_consent"
    });

    return { message: "El expediente requiere consentimiento o excepcion justificada.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("notas_clinicas")
    .insert({
      expediente_id: expediente.id,
      patient_id: expediente.patient_id,
      professional_id: actor.id,
      created_by_user_id: actor.id,
      note_type: parsed.data.noteType,
      status: "borrador",
      ...noteBodyPayload(parsed.data)
    })
    .select("id")
    .single();

  if (error || !data) {
    Sentry.captureException(error ?? new Error("Clinical note insert did not return an id"), {
      extra: {
        expediente_id: expediente.id,
        professional_id: actor.id,
        note_type: parsed.data.noteType
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_create",
      entityType: "notas_clinicas",
      entityId: expediente.id,
      result: "error",
      metadata: {
        note_type: parsed.data.noteType
      },
      context: "audit_nota_clinica_create_error"
    });

    return { message: "No fue posible crear la nota clinica.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "nota_clinica_create",
    entityType: "notas_clinicas",
    entityId: data.id,
    result: "success",
    metadata: {
      expediente_id: expediente.id,
      note_type: parsed.data.noteType
    },
    context: "audit_nota_clinica_create_success"
  });

  revalidatePath(`/professional/expedientes/${expediente.id}`);

  return { message: "Nota clinica creada en borrador.", ok: true };
}

export async function updateDraftNotaClinicaAction(
  _previousState: NotaActionState,
  formData: FormData
): Promise<NotaActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = updateDraftSchema.safeParse({
    noteId: formData.get("noteId"),
    ...parseNoteBody(formData)
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos invalidos.", ok: false };
  }

  const note = await assertNotaOwner(parsed.data.noteId, actor.id);

  if (!note) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_update_draft",
      entityType: "notas_clinicas",
      entityId: parsed.data.noteId,
      result: "denied",
      context: "audit_nota_clinica_update_denied"
    });

    return { message: "No tienes permiso para modificar esta nota.", ok: false };
  }

  if (note.status !== "borrador") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_update_draft",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "denied",
      context: "audit_nota_clinica_update_denied_immutable"
    });

    return { message: "Solo las notas en borrador pueden editarse.", ok: false };
  }

  if (note.created_by_user_id !== actor.id) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_update_draft",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "denied",
      context: "audit_nota_clinica_update_denied_creator"
    });

    return { message: "Solo quien creo el borrador puede modificarlo.", ok: false };
  }

  const expediente = await assertExpedienteOwner(note.expediente_id, actor.id);

  if (!expediente || expediente.status !== "activo") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_update_draft",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "denied",
      context: "audit_nota_clinica_update_denied_not_active"
    });

    return { message: "El expediente no esta activo y no puede modificarse.", ok: false };
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("notas_clinicas")
    .update(noteBodyPayload(parsed.data))
    .eq("id", note.id)
    .eq("professional_id", actor.id)
    .eq("created_by_user_id", actor.id)
    .eq("status", "borrador");

  if (error) {
    Sentry.captureException(error, {
      extra: {
        note_id: note.id,
        expediente_id: note.expediente_id
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_update_draft",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "error",
      context: "audit_nota_clinica_update_error"
    });

    return { message: "No fue posible guardar el borrador.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "nota_clinica_update_draft",
    entityType: "notas_clinicas",
    entityId: note.id,
    result: "success",
    metadata: {
      expediente_id: note.expediente_id
    },
    context: "audit_nota_clinica_update_success"
  });

  revalidatePath(`/professional/notas/${note.id}`);
  revalidatePath(`/professional/expedientes/${note.expediente_id}`);

  return { message: "Borrador guardado.", ok: true };
}

export async function confirmNotaClinicaAction(
  _previousState: NotaActionState,
  formData: FormData
): Promise<NotaActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = noteIdSchema.safeParse({
    noteId: formData.get("noteId")
  });

  if (!parsed.success) {
    return { message: "Datos invalidos.", ok: false };
  }

  const note = await assertNotaOwner(parsed.data.noteId, actor.id);

  if (!note) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_confirm",
      entityType: "notas_clinicas",
      entityId: parsed.data.noteId,
      result: "denied",
      context: "audit_nota_clinica_confirm_denied"
    });

    return { message: "No tienes permiso para confirmar esta nota.", ok: false };
  }

  if (note.status !== "borrador") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_confirm",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "denied",
      metadata: {
        current_status: note.status
      },
      context: "audit_nota_clinica_confirm_denied_status"
    });

    return { message: "Solo las notas en borrador pueden confirmarse.", ok: false };
  }

  if (note.created_by_user_id !== actor.id) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_confirm",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "denied",
      context: "audit_nota_clinica_confirm_denied_creator"
    });

    return { message: "Solo quien creo el borrador puede confirmarlo.", ok: false };
  }

  const expediente = await assertExpedienteOwner(note.expediente_id, actor.id);

  if (!expediente || expediente.status !== "activo") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_confirm",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "denied",
      context: "audit_nota_clinica_confirm_denied_not_active"
    });

    return { message: "El expediente no esta activo y no puede modificarse.", ok: false };
  }

  const now = new Date().toISOString();
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("notas_clinicas")
    .update({
      status: "confirmada",
      confirmed_at: now,
      confirmed_by_user_id: actor.id
    })
    .eq("id", note.id)
    .eq("professional_id", actor.id)
    .eq("created_by_user_id", actor.id)
    .eq("status", "borrador");

  if (error) {
    Sentry.captureException(error, {
      extra: {
        note_id: note.id,
        expediente_id: note.expediente_id
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_confirm",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "error",
      context: "audit_nota_clinica_confirm_error"
    });

    return { message: "No fue posible confirmar la nota.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "nota_clinica_confirm",
    entityType: "notas_clinicas",
    entityId: note.id,
    result: "success",
    metadata: {
      expediente_id: note.expediente_id
    },
    context: "audit_nota_clinica_confirm_success"
  });

  revalidatePath(`/professional/notas/${note.id}`);
  revalidatePath(`/professional/expedientes/${note.expediente_id}`);

  return { message: "Nota clinica confirmada.", ok: true };
}

export async function createNotaAddendumAction(
  _previousState: NotaActionState,
  formData: FormData
): Promise<NotaActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = addendumSchema.safeParse({
    noteId: formData.get("noteId"),
    correctionReason: formData.get("correctionReason"),
    content: formData.get("content")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos invalidos.", ok: false };
  }

  const note = await assertNotaOwner(parsed.data.noteId, actor.id);

  if (!note) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_addendum",
      entityType: "notas_clinicas",
      entityId: parsed.data.noteId,
      result: "denied",
      context: "audit_nota_clinica_addendum_denied"
    });

    return { message: "No tienes permiso para corregir esta nota.", ok: false };
  }

  if (!["confirmada", "con_addendum", "exportada"].includes(note.status)) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_addendum",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "denied",
      metadata: {
        current_status: note.status
      },
      context: "audit_nota_clinica_addendum_denied_status"
    });

    return { message: "Solo las notas confirmadas pueden corregirse con addendum.", ok: false };
  }

  const expediente = await assertExpedienteOwner(note.expediente_id, actor.id);

  if (!expediente || expediente.status !== "activo") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_addendum",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "denied",
      context: "audit_nota_clinica_addendum_denied_not_active"
    });

    return { message: "El expediente no esta activo y no puede modificarse.", ok: false };
  }

  const now = new Date().toISOString();
  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin
    .from("notas_clinicas")
    .insert({
      expediente_id: note.expediente_id,
      patient_id: note.patient_id,
      professional_id: actor.id,
      created_by_user_id: actor.id,
      note_type: "addendum",
      status: "confirmada",
      session_date: now.slice(0, 10),
      content: parsed.data.content,
      clinical_summary: parsed.data.correctionReason,
      addendum_to_note_id: note.id,
      correction_reason: parsed.data.correctionReason,
      confirmed_at: now,
      confirmed_by_user_id: actor.id
    })
    .select("id")
    .single();

  if (error || !data) {
    Sentry.captureException(error ?? new Error("Addendum insert did not return an id"), {
      extra: {
        note_id: note.id,
        expediente_id: note.expediente_id
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_addendum",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "error",
      context: "audit_nota_clinica_addendum_error"
    });

    return { message: "No fue posible registrar el addendum.", ok: false };
  }

  const { error: originalUpdateError } = await supabaseAdmin
    .from("notas_clinicas")
    .update({ status: "con_addendum" })
    .eq("id", note.id)
    .eq("professional_id", actor.id);

  if (originalUpdateError) {
    Sentry.captureException(originalUpdateError, {
      extra: {
        note_id: note.id,
        addendum_id: data.id,
        expediente_id: note.expediente_id
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_addendum",
      entityType: "notas_clinicas",
      entityId: data.id,
      result: "error",
      metadata: {
        original_note_id: note.id
      },
      context: "audit_nota_clinica_addendum_original_update_error"
    });

    return { message: "El addendum se creo, pero no fue posible marcar la nota original.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "nota_clinica_addendum",
    entityType: "notas_clinicas",
    entityId: data.id,
    result: "success",
    metadata: {
      expediente_id: note.expediente_id,
      original_note_id: note.id
    },
    context: "audit_nota_clinica_addendum_success"
  });

  revalidatePath(`/professional/notas/${note.id}`);
  revalidatePath(`/professional/expedientes/${note.expediente_id}`);

  return { message: "Addendum registrado.", ok: true };
}

export async function annulNotaClinicaAction(
  _previousState: NotaActionState,
  formData: FormData
): Promise<NotaActionState> {
  const actor = await getActiveProfessional();

  if (!actor) {
    return { message: "No tienes una sesion profesional activa.", ok: false };
  }

  const parsed = annulSchema.safeParse({
    noteId: formData.get("noteId"),
    annulmentReason: formData.get("annulmentReason")
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Datos invalidos.", ok: false };
  }

  const note = await assertNotaOwner(parsed.data.noteId, actor.id);

  if (!note) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_annul",
      entityType: "notas_clinicas",
      entityId: parsed.data.noteId,
      result: "denied",
      context: "audit_nota_clinica_annul_denied"
    });

    return { message: "No tienes permiso para anular esta nota.", ok: false };
  }

  if (!["confirmada", "con_addendum", "exportada"].includes(note.status)) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_annul",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "denied",
      metadata: {
        current_status: note.status
      },
      context: "audit_nota_clinica_annul_denied_status"
    });

    return { message: "Solo las notas confirmadas pueden anularse logicamente.", ok: false };
  }

  const expediente = await assertExpedienteOwner(note.expediente_id, actor.id);

  if (!expediente || expediente.status !== "activo") {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_annul",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "denied",
      context: "audit_nota_clinica_annul_denied_not_active"
    });

    return { message: "El expediente no esta activo y no puede modificarse.", ok: false };
  }

  const now = new Date().toISOString();
  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("notas_clinicas")
    .update({
      status: "anulada_logicamente",
      annulment_reason: parsed.data.annulmentReason,
      annulled_at: now,
      annulled_by_user_id: actor.id
    })
    .eq("id", note.id)
    .eq("professional_id", actor.id);

  if (error) {
    Sentry.captureException(error, {
      extra: {
        note_id: note.id,
        expediente_id: note.expediente_id
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_annul",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "error",
      context: "audit_nota_clinica_annul_error"
    });

    return { message: "No fue posible anular logicamente la nota.", ok: false };
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "nota_clinica_annul",
    entityType: "notas_clinicas",
    entityId: note.id,
    result: "success",
    metadata: {
      expediente_id: note.expediente_id
    },
    context: "audit_nota_clinica_annul_success"
  });

  revalidatePath(`/professional/notas/${note.id}`);
  revalidatePath(`/professional/expedientes/${note.expediente_id}`);

  return { message: "Nota anulada logicamente.", ok: true };
}

export async function prepareNotaExportAction(formData: FormData) {
  const actor = await getActiveProfessional();

  if (!actor) {
    redirect("/auth/login");
  }

  const parsed = noteIdSchema.safeParse({
    noteId: formData.get("noteId")
  });

  if (!parsed.success) {
    redirect("/professional/notas");
  }

  const note = await assertNotaOwner(parsed.data.noteId, actor.id);

  if (!note) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_export",
      entityType: "notas_clinicas",
      entityId: parsed.data.noteId,
      result: "denied",
      context: "audit_nota_clinica_export_denied"
    });

    redirect("/professional/notas");
  }

  if (!["confirmada", "con_addendum", "exportada"].includes(note.status)) {
    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_export",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "denied",
      metadata: {
        current_status: note.status
      },
      context: "audit_nota_clinica_export_denied_status"
    });

    redirect(`/professional/notas/${note.id}`);
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { error } = await supabaseAdmin
    .from("notas_clinicas")
    .update({
      status: note.status === "confirmada" ? "exportada" : note.status,
      exported_at: new Date().toISOString()
    })
    .eq("id", note.id)
    .eq("professional_id", actor.id)
    .in("status", ["confirmada", "con_addendum", "exportada"]);

  if (error) {
    Sentry.captureException(error, {
      extra: {
        note_id: note.id,
        expediente_id: note.expediente_id
      }
    });

    await safeWriteAuditLog({
      userId: actor.id,
      role: actor.role,
      action: "nota_clinica_export",
      entityType: "notas_clinicas",
      entityId: note.id,
      result: "error",
      context: "audit_nota_clinica_export_error"
    });

    redirect(`/professional/notas/${note.id}`);
  }

  await safeWriteAuditLog({
    userId: actor.id,
    role: actor.role,
    action: "nota_clinica_export",
    entityType: "notas_clinicas",
    entityId: note.id,
    result: "success",
    metadata: {
      expediente_id: note.expediente_id
    },
    context: "audit_nota_clinica_export_success"
  });

  revalidatePath(`/professional/notas/${note.id}`);
  redirect(`/professional/notas/${note.id}/export`);
}
