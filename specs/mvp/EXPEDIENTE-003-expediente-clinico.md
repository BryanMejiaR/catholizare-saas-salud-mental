# EXPEDIENTE-003 — Expediente Clínico

## Propósito

Gestionar el expediente clínico digital de cada Paciente conforme a la NOM-004-SSA3-2012, integrando datos de identificación, consentimiento informado, estado del expediente, historia clínica psicológica, notas de sesión, procesos terapéuticos, evaluaciones psicológicas, documentos asociados y trazabilidad de acceso.

El expediente clínico es el contenedor maestro de la información clínica del Paciente. Las notas clínicas, procesos terapéuticos, consentimientos, evaluaciones psicológicas, historial de citas y documentos adjuntos se almacenan como entidades relacionadas.

El módulo debe proteger la confidencialidad, integridad, disponibilidad y trazabilidad de la información clínica.

Administradores y Super Administradores no tienen acceso al contenido clínico del expediente en operación normal.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Crea, consulta, actualiza, archiva y da seguimiento al expediente clínico de sus Pacientes asignados. |
| Paciente | No accede al expediente completo en el MVP; solo puede ver elementos explícitamente publicados para él en el portal. |
| Administrador | No accede al contenido clínico; solo puede ver estados administrativos mínimos. |
| Super Administrador | No accede al contenido clínico en operación normal; puede auditar actividad administrativa y técnica según permisos. |
| IA clínica asistida | Puede apoyar al Profesional con borradores clínicos bajo consentimiento, control profesional, minimización de datos y auditoría. |

---

## Funcionalidades

### F-01 Crear expediente clínico

El Profesional puede crear un expediente clínico para un Paciente asignado.

El expediente debe quedar vinculado a:

- Paciente;
- Profesional responsable principal;
- organización, si aplica;
- fecha de creación;
- estado inicial del expediente;
- consentimiento informado;
- historial de citas;
- procesos terapéuticos relacionados;
- notas de sesión relacionadas;
- evaluaciones psicológicas relacionadas;
- documentos adjuntos relacionados.

Restricciones:

- Un Paciente puede tener un expediente activo principal dentro de una organización.
- El expediente solo puede ser creado por un Profesional autorizado.
- La creación del expediente debe quedar registrada en auditoría.
- El expediente no debe ser visible para Administradores ni Super Administradores en su contenido clínico.

---

### F-02 Datos de identificación del Paciente

El expediente debe registrar datos de identificación y contacto suficientes para la correcta integración clínica, administrativa y legal del expediente, conforme a la NOM-004-SSA3-2012, la política interna de Catholizare y el aviso de privacidad.

Campos mínimos:

- Nombre completo.
- Fecha de nacimiento.
- Edad.
- Sexo.
- Teléfono de contacto.
- Correo electrónico.
- Domicilio o lugar de residencia, según política interna.
- Contacto de emergencia.
- Motivo de consulta inicial.

Campos condicionales:

- Nombre y teléfono del responsable legal, obligatorio para menores de edad o personas que requieran representación.
- Datos del familiar o contacto de emergencia.
- Número de seguridad social, solo si aplica y si la finalidad está justificada.
- Datos fiscales, solo si son necesarios para procesos administrativos o facturación y pertenecen al módulo correspondiente.

Restricciones:

- Los datos de identificación no deben enviarse a servicios de IA salvo que exista una finalidad explícita y justificada.
- Los datos de identificación no deben mostrarse en reportes agregados.
- Toda modificación de datos de identificación debe quedar registrada en auditoría.

---

### F-03 Consentimiento informado

El expediente debe registrar el consentimiento informado antes del inicio del tratamiento psicológico.

Campos mínimos a registrar:

- estado del consentimiento;
- fecha de firma;
- modalidad: físico, digital o pendiente;
- profesional que obtuvo el consentimiento;
- referencia al documento físico o digital;
- fecha de carga del documento, si aplica;
- usuario que registró el consentimiento.

El sistema puede almacenar el documento digitalizado en PDF o imagen, o registrar únicamente la confirmación de que fue firmado en físico.

Sin consentimiento informado registrado, el sistema no permite crear notas clínicas ni iniciar procesos terapéuticos, salvo registro de atención inicial, orientación previa, urgencia o excepción justificada conforme a política interna.

Toda creación, carga, modificación o sustitución del consentimiento informado debe quedar registrada en auditoría.

---

### F-04 Historia clínica psicológica

El Profesional puede registrar y actualizar la historia clínica psicológica del Paciente.

La historia clínica puede incluir:

- motivo de consulta;
- historia del problema actual;
- antecedentes psicológicos;
- antecedentes psiquiátricos;
- antecedentes médicos relevantes;
- antecedentes familiares relevantes;
- antecedentes de tratamiento psicológico o psiquiátrico;
- antecedentes de medicación, si el Paciente los reporta;
- contexto familiar;
- contexto relacional;
- contexto laboral o académico;
- contexto espiritual o religioso, cuando el Paciente lo comparta y sea clínicamente pertinente;
- factores de riesgo;
- factores protectores;
- recursos personales;
- observaciones clínicas iniciales.

Restricciones:

- La historia clínica pertenece al contenido clínico protegido.
- No es visible para Administradores ni Super Administradores.
- No debe utilizarse en reportes administrativos.
- No debe enviarse completa a IA de forma libre o automática.
- Toda modificación debe conservar trazabilidad.

---

### F-05 Notas de sesión

El Profesional puede registrar notas clínicas de sesión vinculadas al expediente.

Cada nota de sesión debe estar vinculada a:

- expediente;
- Paciente;
- Profesional;
- cita, si aplica;
- proceso terapéutico, si aplica;
- fecha de sesión;
- fecha de creación de la nota;
- usuario que creó la nota;
- fecha de última modificación.

Restricciones:

- Las notas de sesión son contenido clínico protegido.
- No son visibles para el Paciente en el MVP, salvo que el Profesional publique explícitamente un resumen terapéutico compartido para el portal.
- No son visibles para Administradores ni Super Administradores.
- Las notas no se eliminan físicamente desde la operación ordinaria.
- Si una nota se usa para conceptualización con IA, debe quedar registrado qué nota o resumen de nota fue incluido.

---

### F-06 Evaluaciones psicológicas y documentos asociados

El Profesional puede vincular al expediente evaluaciones psicológicas, resultados de pruebas, documentos adjuntos y archivos clínicamente relevantes.

Las evaluaciones psicológicas se gestionan desde EVAL-014.

El expediente puede almacenar:

- nombre de la prueba, inventario o evaluación;
- fecha de aplicación;
- finalidad clínica;
- puntajes;
- resultados;
- interpretación clínica validada;
- resumen clínico de evaluación;
- archivo adjunto autorizado, si aplica;
- Profesional que aplicó, registró o validó;
- relación con conceptualización, plan de tratamiento o seguimiento.

En el MVP, Catholizare OS no almacena bancos de pruebas psicológicas completas, reactivos protegidos, manuales completos ni claves de corrección protegidas.

El Profesional puede cargar imágenes de hojas, inventarios, protocolos o resultados en EVAL-014 para análisis asistido por GPT-007, siempre bajo su responsabilidad profesional, licencia o autorización aplicable.

Restricciones:

- Los resultados de pruebas psicológicas son contenido clínico protegido.
- No deben mostrarse en reportes administrativos.
- No deben mostrarse al Paciente en el portal durante el MVP.
- No deben enviarse a IA salvo dentro de una función clínica explícita y autorizada.
- Las imágenes de evaluaciones deben tratarse como contenido clínico protegido.
- El sistema no debe convertirse en repositorio de instrumentos protegidos.
- El sistema debe registrar quién cargó, modificó, consultó, analizó o validó cada evaluación.
- Los documentos adjuntos deben cumplir las políticas de privacidad, almacenamiento, derechos de autor y seguridad del sistema.

---

### F-07 Archivar expediente

El Profesional puede archivar un expediente cuando el proceso terapéutico ha concluido o cuando el expediente ya no está activo.

El archivado es lógico: el expediente sigue existiendo y es consultable conforme a permisos, pero no aparece en la lista activa.

No se permite eliminar expedientes desde la operación ordinaria del sistema.

La política de retención mínima será de 5 años contados a partir del último acto clínico registrado, conforme a la NOM-004-SSA3-2012.

Cualquier plazo adicional para menores de edad, procesos legales, solicitudes ARCO, bloqueo, conservación especial o supresión deberá definirse en la política de privacidad y en el procedimiento legal correspondiente.

---

### F-08 Publicar resumen terapéutico compartido para el Paciente

El Profesional puede redactar y publicar un resumen terapéutico compartido visible para el Paciente en su portal.

El resumen es un campo de texto libre redactado conscientemente para el Paciente. No es copia automática del expediente, no sustituye notas clínicas y no sustituye conceptualización interna.

El resumen terapéutico compartido puede ser redactado manualmente por el Profesional o generado como borrador con apoyo de GPT-007.

Cuando el resumen sea generado con apoyo de IA, el sistema debe tratarlo como borrador. El Profesional debe revisarlo, corregirlo y aprobarlo antes de publicarlo.

El Paciente nunca ve borradores generados por IA. Solo ve contenido aprobado y publicado por el Profesional.

Restricciones:

- No debe incluir notas internas del terapeuta.
- No debe incluir hipótesis clínicas no comunicadas al Paciente.
- No debe incluir conceptualizaciones internas completas.
- No debe incluir diagnósticos no explicados previamente al Paciente.
- No debe incluir resultados completos de pruebas psicológicas.
- No debe incluir información de terceros.
- No debe publicar automáticamente contenido generado por IA.
- Debe poder editarse, actualizarse o despublicarse.
- Toda publicación, edición o despublicación debe quedar registrada en auditoría.

---

### F-09 Conceptualización asistida por IA

El Profesional puede solicitar apoyo de IA para generar un borrador de conceptualización clínica del caso.

Para iniciar esta función, el Profesional selecciona **"Conceptualizar caso con IA"**.

La IA trabajará con tres fuentes controladas:

1. Expediente clínico del Paciente, según campos autorizados.
2. Notas de sesiones previas, cuando la conceptualización sea posterior a la primera sesión.
3. Directrices clínicas agregadas por el Profesional.

Para esta función, "expediente" significa:

**expediente clínico + notas de sesiones disponibles y autorizadas + directrices clínicas del Profesional.**

El paquete clínico para IA puede incluir motivo de consulta, historia, antecedentes, diagnósticos previos, resultados de pruebas psicológicas, notas seleccionadas o resumidas, evolución, factores de riesgo y protectores, objetivos, contexto familiar, relacional y espiritual cuando sea pertinente.

Restricciones:

- La IA no emite diagnóstico definitivo.
- La IA no sustituye el juicio clínico del Profesional.
- La IA no accede libremente al expediente completo.
- La IA no guarda automáticamente sus resultados.
- El Profesional debe revisar, corregir y aprobar cualquier contenido antes de incorporarlo al expediente.

---

### F-10 Guardar conceptualización aprobada

Después de recibir un borrador de conceptualización asistida por IA, el Profesional puede descartarlo, editarlo, corregirlo, complementarlo, aprobarlo y guardarlo en el expediente.

Restricciones:

- La conceptualización guardada debe indicar que fue revisada y aprobada por el Profesional.
- El texto final pertenece al expediente clínico.
- El sistema debe diferenciar entre borrador generado por IA, versión editada y versión aprobada.
- La responsabilidad clínica corresponde al Profesional que aprueba.

---

## Reglas de negocio

1. Un expediente pertenece a exactamente un Paciente.
2. Cada expediente pertenece a exactamente un Profesional y un Paciente. No existe un expediente compartido entre Profesionales. Un Paciente puede tener hasta 3 expedientes activos simultáneos, uno por cada Profesional asignado, cada uno independiente y sin acceso cruzado entre Profesionales (ver D-11 en `docs/decisions-log.md`).
3. Los expedientes no se eliminan desde la operación ordinaria; solo pueden archivarse, bloquearse o conservarse conforme a política interna y normatividad aplicable.
4. La política de retención mínima será de 5 años contados a partir del último acto clínico registrado.
5. El contenido del expediente no es accesible para Administradores ni Super Administradores en operación normal.
6. El Administrador solo puede ver estados administrativos mínimos.
7. Los servicios de IA no tendrán acceso libre, permanente o indiscriminado al expediente clínico completo.
8. Para conceptualización asistida por IA, "expediente" significa expediente clínico + notas de sesiones disponibles y autorizadas + directrices clínicas del Profesional.
9. La IA no sustituye el juicio clínico del Profesional y sus respuestas son borradores hasta revisión y aprobación.
10. El resumen terapéutico compartido puede ser redactado por el Profesional o generado como borrador por IA.
11. El resumen generado con IA no se publica automáticamente.
12. El Paciente nunca ve borradores de IA.
13. Toda lectura, creación, modificación, archivado, bloqueo o consulta del expediente genera log de auditoría.
14. Toda modificación de datos sensibles debe conservar trazabilidad.
15. El Paciente no accede al expediente completo desde el portal en MVP.
16. El expediente clínico es confidencial y debe tratarse bajo mínimo privilegio.
17. Las notas de sesión forman parte del contenido clínico protegido.
18. Los resultados de pruebas psicológicas y de personalidad forman parte del contenido clínico protegido.
19. Las imágenes de evaluaciones psicológicas cargadas en EVAL-014 son contenido clínico protegido.
20. El expediente no debe convertirse en repositorio de instrumentos psicológicos protegidos.
21. Los datos de espiritualidad, vida religiosa, creencias o vida moral solo deben registrarse cuando hayan sido compartidos libremente por el Paciente y sean clínicamente pertinentes.
22. Ningún dato clínico podrá utilizarse para estadísticas administrativas individualizadas, rankings de Profesionales o reportes que identifiquen directa o indirectamente al Paciente.

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `expediente_id` | Identificador único del expediente |
| `patient_id` | Paciente al que pertenece el expediente |
| `professional_id` | Profesional propietario y único responsable del expediente |
| `identification_data` | Datos de identificación y contacto |
| `clinical_history` | Historia clínica psicológica |
| `initial_consultation_reason` | Motivo de consulta inicial |
| `clinical_status` | Estado clínico-administrativo |
| `consent_status` | `pendiente`, `firmado_fisico`, `firmado_digital`, `excepcion_justificada` |
| `consent_date` | Fecha de firma del consentimiento |
| `consent_document_id` | Documento asociado al consentimiento, si aplica |
| `session_notes_count` | Número de notas asociadas |
| `assessments_count` | Número de evaluaciones asociadas |
| `documents_count` | Número de documentos adjuntos |
| `patient_summary` | Resumen terapéutico compartido publicado |
| `patient_summary_status` | `no_publicado`, `publicado`, `despublicado` |
| `patient_summary_source` | `manual`, `ia_asistida` |
| `patient_summary_approved_by_professional_id` | Profesional que aprobó el resumen |
| `status` | `activo`, `archivado`, `bloqueado` |
| `created_at` | Fecha de creación |
| `updated_at` | Fecha de última modificación |
| `last_clinical_activity_at` | Fecha del último acto clínico |

---

## Entidades relacionadas

| Entidad | Descripción |
|---|---|
| `session_notes` | Notas clínicas de sesión vinculadas al expediente |
| `appointments` | Citas vinculadas al expediente |
| `therapeutic_processes` | Procesos terapéuticos vinculados |
| `psychological_assessments` | Evaluaciones psicológicas, imágenes autorizadas, resultados e interpretaciones validadas desde EVAL-014 |
| `documents` | Documentos clínicos o administrativos asociados |
| `consents` | Consentimientos informados asociados |
| `ai_conceptualizations` | Borradores o conceptualizaciones asistidas por IA |
| `patient_summaries` | Resúmenes terapéuticos compartidos publicados o despublicados |
| `audit_logs` | Registros de auditoría relacionados |

---

## Requisitos normativos

- NOM-004-SSA3-2012: expediente clínico, conservación, confidencialidad y manejo.
- NOM-024-SSA3-2012: trazabilidad, seguridad e interoperabilidad en sistemas de información de salud.
- Ley Federal de Protección de Datos Personales en Posesión de los Particulares: datos de salud, creencias religiosas, filosóficas o morales son datos sensibles.
- Aviso de privacidad de Catholizare: finalidades, derechos ARCO, transferencias, medidas de seguridad y uso de servicios tecnológicos relacionados.

---

## Dependencias

- USERS-002 — gestión de usuarios, Pacientes y Profesionales.
- AGENDA-008 — historial de citas y actos clínicos relacionados.
- NOTAS-004 — notas clínicas.
- EVAL-014 — evaluaciones psicológicas, carga de imágenes, análisis asistido por IA y resultados validados.
- PROCESO-GENERAL-005 — procesos terapéuticos generales.
- PROCESO-TCC-006 — procesos terapéuticos basados en TCC, si aplica.
- PORTAL-011 — visualización limitada de información para el Paciente.
- ADMIN-012 — estados administrativos mínimos, sin acceso clínico.
- GPT-007 — asistente clínico con IA para conceptualización, tratamiento, planeación, evaluación y resumen terapéutico compartido.

---

## Fuera de alcance del MVP

- Acceso del Paciente al expediente clínico completo.
- Eliminación física de expedientes desde operación ordinaria.
- Interoperabilidad completa con otros sistemas clínicos externos.
- Firma electrónica avanzada.
- Portal de descarga completa del expediente.
- Exportación clínica completa en PDF.
- Solicitudes ARCO automatizadas dentro del sistema.
- Acceso administrativo al contenido clínico.
- Uso libre o no supervisado de IA sobre expedientes completos.
- Diagnóstico automático por IA.
- Publicación automática de contenido generado por IA en el portal del Paciente.
- Banco interno de pruebas psicológicas protegidas.
- Almacenamiento de manuales completos de pruebas.
- Distribución de pruebas psicológicas al Paciente desde el sistema.
- Estadísticas clínicas individualizadas.
- Rankings clínicos de Profesionales.
