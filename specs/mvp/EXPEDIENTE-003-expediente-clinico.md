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

La nota de sesión puede incluir:

- resumen clínico de la sesión;
- síntomas o dificultades trabajadas;
- intervenciones realizadas;
- respuesta del Paciente;
- tareas o acuerdos terapéuticos;
- evolución observada;
- riesgos identificados;
- plan para la siguiente sesión;
- observaciones clínicas relevantes.

Restricciones:

- Las notas de sesión son contenido clínico protegido.
- No son visibles para el Paciente en el MVP, salvo que el Profesional publique explícitamente un resumen terapéutico compartido para el portal.
- No son visibles para Administradores ni Super Administradores.
- Las notas no se eliminan físicamente desde la operación ordinaria.
- Las modificaciones deben conservar historial, fecha, usuario y motivo de edición.
- Si una nota se usa para conceptualización con IA, debe quedar registrado qué nota o resumen de nota fue incluido.

---

### F-06 Evaluaciones psicológicas y documentos asociados

El Profesional puede vincular al expediente evaluaciones psicológicas, resultados de pruebas, documentos adjuntos y archivos clínicamente relevantes.

Elementos permitidos:

- resultados de pruebas psicológicas;
- resultados de pruebas de personalidad;
- cuestionarios clínicos;
- documentos firmados;
- consentimiento informado;
- reportes externos;
- referencias médicas o psicológicas;
- documentos aportados por el Paciente;
- archivos clínicos relevantes.

Restricciones:

- Los resultados de pruebas psicológicas son contenido clínico protegido.
- No deben mostrarse en reportes administrativos.
- No deben enviarse a IA salvo dentro de una función clínica explícita y autorizada.
- El sistema debe registrar quién cargó, modificó o consultó cada documento.
- Los documentos adjuntos deben cumplir las políticas de privacidad, almacenamiento y seguridad del sistema.

---

### F-07 Archivar expediente

El Profesional puede archivar un expediente cuando el proceso terapéutico ha concluido o cuando el expediente ya no está activo.

El archivado es lógico: el expediente sigue existiendo y es consultable conforme a permisos, pero no aparece en la lista activa.

No se permite eliminar expedientes desde la operación ordinaria del sistema.

La política de retención mínima será de 5 años contados a partir del último acto clínico registrado, conforme a la NOM-004-SSA3-2012.

Cualquier plazo adicional para menores de edad, procesos legales, solicitudes ARCO, bloqueo, conservación especial o supresión deberá definirse en la política de privacidad y en el procedimiento legal correspondiente.

Campos mínimos de archivado:

- fecha de archivado;
- usuario que archiva;
- motivo administrativo de archivado;
- estado final del expediente;
- fecha del último acto clínico registrado.

---

### F-08 Publicar resumen terapéutico compartido para el Paciente

El Profesional puede redactar y publicar un resumen terapéutico compartido visible para el Paciente en su portal.

El resumen es un campo de texto libre redactado conscientemente para el Paciente.

No es una copia automática del expediente clínico.

No sustituye las notas clínicas.

No sustituye la conceptualización interna del caso.

El resumen terapéutico compartido puede ser redactado manualmente por el Profesional o generado como borrador con apoyo de GPT-007.

Cuando el resumen sea generado con apoyo de IA, el sistema debe tratarlo como borrador. El Profesional debe revisarlo, corregirlo y aprobarlo antes de publicarlo en el portal del Paciente.

El Paciente nunca ve borradores generados por IA. Solo ve contenido aprobado y publicado por el Profesional.

El resumen puede utilizarse para:

- acuerdos generales de seguimiento;
- pautas psicoeducativas;
- recordatorios terapéuticos;
- objetivos generales del proceso;
- tareas o indicaciones no sensibles;
- recursos personales identificados;
- recursos espirituales o comunitarios, cuando sean clínicamente pertinentes;
- próximos pasos del proceso;
- indicaciones no sensibles que el Profesional decida compartir.

Restricciones:

- No debe incluir notas internas del terapeuta.
- No debe incluir hipótesis clínicas no comunicadas al Paciente.
- No debe incluir conceptualizaciones internas completas.
- No debe incluir diagnósticos no explicados previamente al Paciente.
- No debe incluir información de terceros.
- No debe incluir interpretaciones que puedan dañar innecesariamente al Paciente fuera de contexto.
- No debe publicar automáticamente contenido generado por IA.
- No sustituye las notas clínicas ni el expediente.
- Debe poder editarse, actualizarse o despublicarse.
- Toda publicación, edición o despublicación debe quedar registrada en auditoría.

---

### F-09 Conceptualización asistida por IA

El Profesional puede solicitar apoyo de IA para generar un borrador de conceptualización clínica del caso.

Para iniciar esta función, el Profesional selecciona la acción:

**“Conceptualizar caso con IA”**

Al seleccionar esta acción, el sistema debe abrir un formulario donde el Profesional pueda agregar directrices, comentarios clínicos, observaciones de entrevista o énfasis que considere relevantes para orientar el análisis de la IA.

La IA trabajará con tres fuentes controladas:

1. **Expediente clínico del Paciente**, según los campos autorizados para esta función.
2. **Notas de sesiones previas**, cuando la conceptualización se realice después de la primera sesión o en una etapa posterior del proceso terapéutico.
3. **Directrices clínicas agregadas por el Profesional**, incluyendo observaciones de entrevista, hipótesis iniciales, dudas clínicas, énfasis terapéuticos o indicaciones sobre el modelo de intervención.

Para esta función, el término “expediente” debe entenderse como:

**expediente clínico + notas de sesiones disponibles y autorizadas + directrices clínicas del Profesional.**

El paquete clínico para IA puede incluir:

- motivo de consulta;
- historia del problema;
- antecedentes relevantes;
- diagnósticos previos;
- resultados de pruebas psicológicas;
- resultados de pruebas de personalidad;
- notas de sesiones seleccionadas o resumidas;
- evolución observada durante el proceso;
- factores de riesgo;
- factores protectores;
- objetivos terapéuticos;
- contexto familiar;
- contexto relacional;
- contexto espiritual o religioso, cuando sea clínicamente pertinente y haya sido compartido por el Paciente;
- directrices, comentarios y observaciones agregadas por el Profesional.

La IA puede generar:

- resumen clínico del caso;
- hipótesis de conceptualización;
- hipótesis diagnósticas diferenciales;
- mecanismos originadores;
- mecanismos mantenedores;
- factores predisponentes, precipitantes, mantenedores y protectores;
- creencias nucleares o esquemas relevantes;
- hipótesis funcional del problema;
- objetivos terapéuticos sugeridos;
- posibles líneas de intervención;
- preguntas clínicas pendientes;
- elementos que conviene explorar en próximas sesiones.

Restricciones:

- La IA no emite diagnóstico definitivo.
- La IA no sustituye el juicio clínico del Profesional.
- La IA no accede libremente al expediente completo.
- La IA solo trabaja con el paquete clínico autorizado, las notas de sesiones permitidas y las directrices agregadas por el Profesional.
- La IA no guarda automáticamente sus resultados en el expediente.
- El Profesional debe revisar, corregir y aprobar cualquier contenido antes de incorporarlo al expediente.
- Toda solicitud de conceptualización asistida por IA debe quedar registrada en auditoría.
- El sistema debe registrar qué datos fueron enviados a la IA, qué notas de sesión fueron incluidas, qué directrices agregó el Profesional, qué usuario solicitó el análisis, fecha, hora y resultado generado.

---

### F-10 Guardar conceptualización aprobada

Después de recibir un borrador de conceptualización asistida por IA, el Profesional puede:

- descartarlo;
- editarlo;
- corregirlo;
- complementarlo;
- aprobarlo;
- guardarlo en el expediente como conceptualización clínica del Profesional.

Restricciones:

- La conceptualización guardada debe indicar que fue revisada y aprobada por el Profesional.
- El texto final pertenece al expediente clínico.
- El sistema debe diferenciar entre:
  - borrador generado por IA;
  - versión editada por el Profesional;
  - versión aprobada y guardada.
- La conceptualización aprobada debe conservar fecha, usuario, versión y trazabilidad.
- La responsabilidad clínica del contenido guardado corresponde al Profesional que lo aprueba.

---

## Reglas de negocio

1. Un expediente pertenece a exactamente un Paciente.

2. El expediente puede tener un Profesional responsable principal y, si el sistema lo permite, profesionales autorizados adicionales.

3. Los expedientes no se eliminan desde la operación ordinaria del sistema; solo pueden archivarse, bloquearse o conservarse conforme a política interna y normatividad aplicable.

4. La política de retención mínima será de 5 años contados a partir del último acto clínico registrado, conforme a la NOM-004-SSA3-2012.

5. Cualquier plazo adicional para menores de edad, procedimientos legales, responsabilidades profesionales o solicitudes ARCO deberá definirse en la política de privacidad y procedimiento legal correspondiente.

6. El contenido del expediente no es accesible para Administradores ni Super Administradores en operación normal.

7. El Administrador solo puede ver estados administrativos mínimos, como expediente activo, archivado o bloqueado.

8. El Super Administrador no accede al contenido clínico del expediente por soporte ordinario.

9. Cualquier acceso excepcional al contenido clínico deberá operar bajo protocolo de emergencia o soporte autorizado, con justificación obligatoria, autorización previa, mínimo privilegio, registro en auditoría y notificación interna conforme a política de privacidad.

10. Los servicios de IA no tendrán acceso libre, permanente o indiscriminado al expediente clínico completo.

11. Cuando el Profesional seleccione “Conceptualizar caso con IA”, el sistema podrá enviar a la IA un paquete clínico controlado, limitado a los datos necesarios para la tarea solicitada.

12. Antes de ejecutar el análisis con IA, el Profesional podrá agregar directrices clínicas, comentarios de entrevista, hipótesis iniciales, dudas o énfasis terapéuticos para orientar el trabajo de la IA.

13. Para conceptualización asistida por IA, “expediente” significa expediente clínico + notas de sesiones disponibles y autorizadas + directrices clínicas del Profesional.

14. La IA no sustituye el juicio clínico del Profesional y sus respuestas se consideran borradores o apoyo técnico hasta que sean revisadas y aprobadas.

15. El resumen terapéutico compartido para el Paciente puede ser redactado por el Profesional o generado como borrador por IA.

16. El resumen terapéutico compartido generado con apoyo de IA no se publica automáticamente.

17. El Paciente nunca ve borradores de IA. Solo ve contenido aprobado y publicado por el Profesional.

18. Toda lectura, creación, modificación, archivado, bloqueo o consulta del expediente genera una entrada en el log de auditoría.

19. Toda modificación de datos sensibles del expediente debe conservar trazabilidad: usuario que modificó, fecha y hora, campo modificado, valor anterior cuando aplique, valor nuevo cuando aplique y motivo de modificación.

20. El Paciente no accede al expediente completo desde el portal en el MVP.

21. El Paciente solo puede ver el resumen terapéutico compartido publicado conscientemente por el Profesional y otros elementos explícitamente autorizados.

22. El expediente clínico es confidencial y debe tratarse bajo principio de mínimo privilegio.

23. Las notas de sesión forman parte del contenido clínico protegido del expediente.

24. Los resultados de pruebas psicológicas y de personalidad forman parte del contenido clínico protegido del expediente.

25. Los datos de espiritualidad, vida religiosa, creencias o vida moral del Paciente solo deben registrarse cuando hayan sido compartidos libremente por el Paciente y sean clínicamente pertinentes.

26. Ningún dato clínico podrá utilizarse para estadísticas administrativas individualizadas, rankings de profesionales o reportes que permitan identificar directa o indirectamente al Paciente.

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `expediente_id` | Identificador único del expediente |
| `patient_id` | Paciente al que pertenece el expediente |
| `primary_professional_id` | Profesional responsable principal del expediente |
| `authorized_professional_ids` | Profesionales autorizados adicionales, si aplica |
| `organization_id` | Organización a la que pertenece el expediente, si aplica |
| `identification_data` | Datos de identificación y contacto del Paciente |
| `clinical_history` | Historia clínica psicológica |
| `initial_consultation_reason` | Motivo de consulta inicial |
| `clinical_status` | Estado clínico-administrativo del expediente |
| `consent_status` | `pendiente`, `firmado_fisico`, `firmado_digital`, `excepcion_justificada` |
| `consent_date` | Fecha de firma del consentimiento |
| `consent_obtained_by_user_id` | Usuario/profesional que obtuvo el consentimiento |
| `consent_document_id` | Documento asociado al consentimiento, si aplica |
| `session_notes_count` | Número de notas de sesión asociadas |
| `last_session_note_at` | Fecha de la última nota de sesión registrada |
| `assessments_count` | Número de evaluaciones psicológicas asociadas |
| `documents_count` | Número de documentos adjuntos asociados |
| `patient_summary` | Resumen terapéutico compartido publicado para el portal del Paciente |
| `patient_summary_status` | `no_publicado`, `publicado`, `despublicado` |
| `patient_summary_source` | `manual`, `ia_asistida` |
| `patient_summary_approved_by_professional_id` | Profesional que aprobó el resumen visible para el Paciente |
| `patient_summary_published_at` | Fecha de publicación del resumen terapéutico compartido |
| `status` | `activo`, `archivado`, `bloqueado` |
| `archive_reason` | Motivo administrativo de archivado, si aplica |
| `created_at` | Fecha de creación |
| `updated_at` | Fecha de última modificación |
| `last_clinical_activity_at` | Fecha del último acto clínico registrado |

---

## Entidades relacionadas

El expediente clínico se relaciona con las siguientes entidades:

| Entidad | Descripción |
|---|---|
| `session_notes` | Notas clínicas de sesión vinculadas al expediente |
| `appointments` | Citas vinculadas al expediente |
| `therapeutic_processes` | Procesos terapéuticos vinculados al expediente |
| `psychological_assessments` | Evaluaciones psicológicas y resultados de pruebas |
| `documents` | Documentos clínicos o administrativos asociados |
| `consents` | Consentimientos informados asociados |
| `ai_conceptualizations` | Borradores o conceptualizaciones asistidas por IA |
| `patient_summaries` | Resúmenes terapéuticos compartidos publicados o despublicados para el Paciente |
| `audit_logs` | Registros de auditoría relacionados con el expediente |

---

## Requisitos normativos

- NOM-004-SSA3-2012: regula la elaboración, integración, uso, manejo, archivo, conservación, propiedad, titularidad y confidencialidad del expediente clínico.
- La política de retención mínima será de 5 años contados a partir del último acto clínico registrado.
- NOM-024-SSA3-2012: se toma como referencia para trazabilidad, seguridad, interoperabilidad y registro electrónico en sistemas de información de salud.
- Ley Federal de Protección de Datos Personales en Posesión de los Particulares: los datos de salud, creencias religiosas, filosóficas o morales son datos personales sensibles y requieren tratamiento legítimo, informado, proporcional y seguro.
- Aviso de privacidad de Catholizare: deberá informar las finalidades del tratamiento, datos tratados, derechos ARCO, transferencias, medidas de seguridad y uso de servicios tecnológicos relacionados.

---

## Dependencias

- USERS-002 — gestión de usuarios, Pacientes y Profesionales.
- AGENDA-008 — historial de citas y actos clínicos relacionados.
- PROCESO-GENERAL-005 — procesos terapéuticos generales.
- PROCESO-TCC-006 — procesos terapéuticos basados en TCC, si aplica.
- PORTAL-011 — visualización limitada de información para el Paciente.
- ADMIN-012 — estados administrativos mínimos, sin acceso clínico.
- GPT-007 — asistente clínico con IA para conceptualización, tratamiento, planeación y resumen terapéutico compartido.
- LOG-014 — auditoría y trazabilidad.
- PRIV-015 — privacidad, consentimiento, anonimización y tratamiento de datos.
- AI-016 — reglas de uso de inteligencia artificial clínica asistida, si aplica.
- ANALYTICS-017 — analítica agregada y anonimizada.

---

## Fuera de alcance del MVP

- Acceso del Paciente al expediente clínico completo.
- Eliminación física de expedientes desde operación ordinaria.
- Interoperabilidad completa con otros sistemas clínicos externos.
- Firma electrónica avanzada.
- Portal de descarga completa del expediente.
- Exportación clínica completa en PDF.
- Solicitudes ARCO automatizadas dentro del sistema.
- Protocolos legales complejos de bloqueo o supresión.
- Acceso administrativo al contenido clínico.
- Uso libre o no supervisado de IA sobre expedientes completos.
- Diagnóstico automático por IA.
- Sustitución del juicio clínico del Profesional por IA.
- Publicación automática de contenido generado por IA en el portal del Paciente.
- Estadísticas clínicas individualizadas.
- Rankings clínicos de Profesionales.
- Compartir expediente entre organizaciones sin autorización explícita.
