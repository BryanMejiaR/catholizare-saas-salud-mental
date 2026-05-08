# NOTAS-004 — Notas Clínicas

## Propósito

Permitir al Profesional registrar los documentos clínicos obligatorios dentro del expediente de cada paciente, conforme a los tipos y requisitos establecidos por la NOM-004-SSA3-2012.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Crea, consulta y confirma notas clínicas |
| Paciente | Sin acceso directo a las notas (el resumen del expediente es independiente) |

---

## Tipos de notas

| Tipo | Código | Cuándo se crea | Obligatoria |
|---|---|---|---|
| Nota de admisión | `admision` | Al iniciar la relación terapéutica | Sí |
| Nota de evolución | `evolucion` | En cada consulta o sesión | Sí |
| Nota de interconsulta | `interconsulta` | Al solicitar o recibir consulta de otro profesional | Condicional |
| Nota de referencia/traslado | `referencia` | Al derivar al paciente | Condicional |
| Nota de egreso | `egreso` | Al cerrar el proceso terapéutico | Sí |

---

## Funcionalidades

### F-01 Crear nota clínica
- El Profesional selecciona el tipo de nota y completa los campos correspondientes.
- Cada tipo de nota tiene una plantilla con los campos definidos por la NOM-004-SSA3-2012.
- La nota se guarda en estado **borrador** hasta que el Profesional la confirma.
- En estado borrador, la nota es editable.

### F-02 Confirmar nota clínica
- El Profesional confirma la nota para darle carácter definitivo.
- Una nota confirmada es **inmutable**: no puede editarse ni eliminarse.
- Si hay un error en una nota confirmada, el Profesional crea una nota de corrección por separado (tipo `evolucion` con referencia explícita a la nota que corrige).

### F-03 Consultar notas
- El expediente muestra el listado de notas clínicas en orden cronológico inverso.
- El Profesional puede filtrar por tipo de nota.
- Cada nota muestra: tipo, fecha de creación, estado (borrador/confirmada), primeras líneas de contenido.
- El Profesional accede al detalle completo de cada nota.

### F-04 Exportar nota a PDF
- El Profesional puede exportar cualquier nota confirmada a PDF.
- El PDF incluye: datos de identificación del paciente (nombre, fecha de nacimiento), tipo de nota, fecha, contenido, nombre y firma del profesional.
- La exportación se usa principalmente para notas de referencia/traslado que deben compartirse con otro profesional.

---

## Plantillas de notas (campos requeridos por NOM-004-SSA3-2012)

### Nota de admisión
- Motivo de consulta
- Antecedentes personales patológicos y no patológicos relevantes
- Antecedentes familiares relevantes
- Exploración del estado mental (orientación, consciencia, afecto, pensamiento, conducta)
- Diagnóstico presuntivo o diagnóstico inicial
- Plan de tratamiento propuesto

### Nota de evolución
- Fecha y hora de la consulta
- Subjetivo: lo que refiere el paciente en la sesión
- Objetivo: observaciones del profesional
- Análisis/evaluación: interpretación clínica
- Plan: acciones o ajustes para la siguiente sesión

### Nota de interconsulta
- Profesional o especialidad a quien se solicita
- Motivo de la interconsulta
- Resumen del caso relevante para el interconsultante
- Resultado o respuesta de la interconsulta (campo separado, se llena cuando llega la respuesta)

### Nota de referencia/traslado
- Institución o profesional destinatario
- Motivo de referencia
- Resumen clínico del caso
- Estado actual del paciente
- Tratamiento en curso al momento del traslado

### Nota de egreso
- Fecha de última consulta
- Diagnóstico final
- Resumen del proceso terapéutico
- Estado del paciente al egreso
- Motivo de egreso (`alta_terapeutica`, `abandono`, `referencia`, `defuncion`, `otro`)
- Recomendaciones post-egreso

---

## Reglas de negocio

1. Solo puede existir **una nota de admisión** por expediente.
2. Solo puede existir **una nota de egreso activa** por proceso terapéutico; si se reabre el proceso, se puede crear una nueva nota de admisión.
3. Las notas confirmadas son inmutables. No hay edición ni eliminación de notas confirmadas.
4. Un borrador no tiene valor clínico legal; solo la nota confirmada cuenta como registro oficial.
5. El Profesional puede tener múltiples borradores abiertos simultáneamente.
6. La nota de egreso cierra el proceso terapéutico activo (ver PROCESO-GENERAL-005 y PROCESO-TCC-006).

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `note_id` | Identificador único de la nota |
| `expediente_id` | Expediente al que pertenece |
| `professional_id` | Profesional que creó la nota |
| `type` | Tipo de nota (ver tabla de tipos) |
| `status` | `borrador`, `confirmada` |
| `content` | Contenido estructurado según plantilla del tipo |
| `created_at` | Fecha de creación |
| `confirmed_at` | Fecha de confirmación (null si es borrador) |

---

## Requisitos normativos

- **NOM-004-SSA3-2012**: define los tipos de notas, sus campos obligatorios y el principio de inmutabilidad de los registros clínicos. Las notas deben ser legibles y no alterables una vez firmadas.
- **NOM-024-SSA3-2012**: toda creación, lectura y confirmación de nota queda registrada en el log de auditoría.

---

## Dependencias

- EXPEDIENTE-003 — las notas viven dentro del expediente clínico.
- PROCESO-GENERAL-005 / PROCESO-TCC-006 — la nota de egreso cierra el proceso terapéutico activo.
- Log de auditoría — registra toda actividad sobre notas.

---

## Fuera de alcance del MVP

- Firma digital del profesional dentro de la plataforma (el PDF de exportación sirve como evidencia)
- Notas de enfermería (Catholizare es para psicólogos, no equipos multidisciplinarios)
- Plantillas personalizables de notas clínicas
- Adjuntar archivos multimedia a notas (audio, video)
