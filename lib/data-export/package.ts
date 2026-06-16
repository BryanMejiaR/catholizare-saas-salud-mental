import "server-only";

import { createHash } from "crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createZip } from "@/lib/data-export/zip";

type ExportFile = {
  bucket: string;
  path: string;
  outputPath: string;
};

function jsonBuffer(value: unknown) {
  return Buffer.from(JSON.stringify(value, null, 2), "utf8");
}

function sha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function buildProfessionalExportPackage(professionalId: string, folio: string) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data: professional, error: professionalError } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, role, account_status, created_at")
    .eq("id", professionalId)
    .single();

  if (professionalError || !professional) {
    throw new Error("Unable to load professional profile for export.");
  }

  const { data: expedientes, error: expedientesError } = await supabaseAdmin
    .from("expedientes")
    .select("*")
    .eq("professional_id", professionalId)
    .order("created_at", { ascending: true });

  if (expedientesError) {
    throw new Error(`Unable to load expedientes: ${expedientesError.message}`);
  }

  const expedienteRows = expedientes ?? [];
  const expedienteIds = expedienteRows.map((expediente) => expediente.id as string);
  const patientIds = [...new Set(expedienteRows.map((expediente) => expediente.patient_id as string))];
  const [
    patients,
    consentimientos,
    historiasClinicas,
    lifeHistories,
    notasClinicas,
    procesos,
    assessments,
    assessmentUploads,
    citas,
    resumenes
  ] = await Promise.all([
    queryIn("profiles", "id, full_name, email, account_status, created_at", "id", patientIds),
    queryIn("consentimientos", "*", "expediente_id", expedienteIds),
    queryIn("historias_clinicas", "*", "expediente_id", expedienteIds),
    queryIn("patient_life_histories", "*", "expediente_id", expedienteIds),
    queryIn("notas_clinicas", "*", "expediente_id", expedienteIds),
    queryIn("procesos_terapeuticos", "*", "expediente_id", expedienteIds),
    queryIn("psychological_assessments", "*", "expediente_id", expedienteIds),
    queryIn("patient_assessment_uploads", "*", "expediente_id", expedienteIds),
    queryIn("citas", "*", "professional_id", [professionalId]),
    queryIn("resumenes_terapeuticos", "*", "expediente_id", expedienteIds)
  ]);
  const files: ExportFile[] = [
    ...consentimientos
      .filter((row) => row.document_storage_path)
      .map((row) => ({
        bucket: "clinical-consents",
        path: row.document_storage_path as string,
        outputPath: `archivos/consentimientos/${row.expediente_id}/${row.document_file_name ?? "consentimiento"}`
      })),
    ...assessmentUploads
      .filter((row) => row.file_storage_path)
      .map((row) => ({
        bucket: "assessment-submissions",
        path: row.file_storage_path as string,
        outputPath: `archivos/pruebas/${row.expediente_id}/${row.file_name ?? "prueba"}`
      }))
  ];
  const downloadedFiles = await downloadStorageFiles(files);
  const manifest = {
    folio,
    generated_at: new Date().toISOString(),
    professional_id: professionalId,
    counts: {
      patients: patients.length,
      expedientes: expedienteRows.length,
      consentimientos: consentimientos.length,
      historias_clinicas: historiasClinicas.length,
      historias_vida: lifeHistories.length,
      notas_clinicas: notasClinicas.length,
      procesos: procesos.length,
      evaluaciones: assessments.length,
      pruebas_subidas: assessmentUploads.length,
      citas: citas.length,
      resumenes: resumenes.length,
      files: downloadedFiles.length
    }
  };
  const packageJson = {
    manifest,
    professional,
    patients,
    expedientes: expedienteRows,
    consentimientos,
    historias_clinicas: historiasClinicas,
    historias_vida: lifeHistories,
    notas_clinicas: notasClinicas,
    procesos,
    evaluaciones: assessments,
    pruebas_subidas: assessmentUploads,
    citas,
    resumenes
  };
  const packageData = jsonBuffer(packageJson);
  const entries = [
    { name: "manifest.json", data: jsonBuffer(manifest) },
    { name: "data/clinical-export.json", data: packageData },
    {
      name: "README.txt",
      data: Buffer.from(
        "Exportacion clinica Catholizare OS. El profesional receptor es responsable de la custodia, resguardo y tratamiento del expediente descargado.\n",
        "utf8"
      )
    },
    ...downloadedFiles
  ];
  const zip = createZip(entries);

  return {
    zip,
    hash: sha256(zip),
    fileName: `catholizare-export-${folio}.zip`
  };
}

async function queryIn(table: string, select: string, column: string, values: string[]) {
  if (values.length === 0) {
    return [] as Record<string, unknown>[];
  }

  const supabaseAdmin = createSupabaseAdminClient();
  const { data, error } = await supabaseAdmin.from(table).select(select).in(column, values);

  if (error) {
    throw new Error(`Unable to export ${table}: ${error.message}`);
  }

  return (data ?? []) as unknown as Record<string, unknown>[];
}

async function downloadStorageFiles(files: ExportFile[]) {
  const supabaseAdmin = createSupabaseAdminClient();
  const entries = [];

  for (const file of files) {
    const { data, error } = await supabaseAdmin.storage.from(file.bucket).download(file.path);

    if (error || !data) {
      entries.push({
        name: `${file.outputPath}.missing.txt`,
        data: Buffer.from(`No fue posible descargar ${file.bucket}/${file.path}.\n`, "utf8")
      });
      continue;
    }

    entries.push({
      name: file.outputPath,
      data: Buffer.from(await data.arrayBuffer())
    });
  }

  return entries;
}
