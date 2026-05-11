# NOTAS-004 — Notas Clínicas

## Propósito

Permitir al Profesional registrar, consultar, confirmar, corregir y exportar notas clínicas vinculadas al expediente clínico de cada Paciente.

Las notas clínicas forman parte del expediente clínico. NOTAS-004 no crea un expediente paralelo, sino que funciona como submódulo operativo para registrar las sesiones, intervenciones, evolución, referencias, interconsultas y egresos de manera práctica y frecuente.

Toda nota clínica debe quedar vinculada obligatoriamente a Paciente, expediente clínico, Profesional, cita si aplica, proceso terapéutico si aplica y organización si aplica. No debe existir una nota clínica suelta.

---

## Relación con EXPEDIENTE-003

EXPEDIENTE-003 es el contenedor clínico maestro. NOTAS-004 es un submódulo operativo del expediente.

```text
EXPEDIENTE-003
  ├── Datos de identificación
  ├── Consentimiento informado
  ├── Historia clínica
  ├── NOTAS-004
  │     ├── nota de admisión
  │     ├── nota de evolución
  │     ├── nota de interconsulta
  │     ├── nota de referencia / traslado
  │     ├── nota de egreso
  │     └── nota de corrección / addendum
  ├── Evaluaciones psicológicas
  ├── Procesos terapéuticos
  ├── Conceptualizaciones
  └── Documentos adjuntos
```

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Crea, consulta, edita borradores, confirma, corrige y exporta notas clínicas de sus Pacientes asignados. |
| Paciente | No accede a las notas clínicas completas en el MVP. |
| Administrador | No accede al contenido de las notas clínicas. |
| Super Administrador | No accede al contenido de las notas clínicas en operación normal. |
| IA clínica asistida | Puede utilizar notas seleccionadas, resumidas o autorizadas dentro de un paquete clínico controlado, bajo activación del Profesional. |
| Sistema | Vincula notas con expediente, paciente, cita, proceso terapéutico y auditoría. |

---

## Funcionalidades

### F-01 Crear nota desde agenda

El Profesional puede crear una nota clínica desde una cita registrada en AGENDA-008.

Al crear la nota desde una cita, el sistema precarga Paciente, expediente clínico activo, Profesional, organización, cita relacionada, fecha y hora de sesión, tipo sugerido de nota y proceso terapéutico activo si existe.

Restricciones:

- No se puede crear una nota sin Paciente.
- No se puede crear una nota sin expediente asociado.
- No se puede crear una nota para un Paciente no asignado al Profesional, salvo permiso explícito.
- Toda creación de nota desde agenda debe quedar registrada en auditoría.

---

### F-02 Crear nota desde expediente

El Profesional puede crear una nota clínica desde el expediente del Paciente.

El sistema debe precargar Paciente, expediente clínico, Profesional, organización, proceso terapéutico activo y últimas citas relacionadas si existen.

El Profesional debe seleccionar tipo de nota, fecha de sesión o acto clínico, cita relacionada si aplica y proceso terapéutico relacionado si aplica.

---

### F-03 Crear nota desde formulario de búsqueda de Paciente

El Profesional puede crear una nota clínica desde el módulo de notas mediante búsqueda de Paciente por nombre, correo, teléfono, identificador interno o lista de pacientes asignados.

Después de seleccionar al Paciente, el sistema carga expediente activo, procesos activos, citas recientes, notas previas relevantes y borradores pendientes.

---

### F-04 Ver notas pendientes

El sistema puede mostrar al Profesional un listado de citas realizadas que aún no tienen nota clínica confirmada.

La lista puede incluir Paciente, fecha, hora, tipo de cita, estado, proceso terapéutico relacionado, botón "Crear nota" y botón "Continuar borrador".

Estados sugeridos:

- sin nota;
- borrador iniciado;
- nota confirmada;
- nota con addendum;
- nota pendiente de revisión.

---

### F-05 Tipos de nota clínica

| Tipo de nota | Uso |
|---|---|
| `admision` | Registro inicial del caso, motivo de consulta, datos clínicos iniciales y primera impresión clínica. |
| `evolucion` | Registro ordinario de sesión, avances, intervenciones, respuesta del Paciente y plan de seguimiento. |
| `interconsulta` | Comunicación clínica con otro Profesional autorizado, cuando aplique. |
| `referencia_traslado` | Registro de recomendación de derivación, referencia o traslado. |
| `egreso` | Cierre del proceso terapéutico, estado final, recomendaciones y seguimiento. |
| `addendum` | Corrección, aclaración o complemento de una nota ya confirmada. |

Reglas:

- Solo puede existir una nota de admisión principal por expediente.
- Si un proceso terapéutico se reabre después de egreso, se crea una nota de reapertura o evolución inicial, no una segunda admisión principal.
- Las notas de addendum deben estar vinculadas a una nota confirmada previa.

---

### F-06 Editar borrador de nota

El Profesional puede crear y editar notas en estado de borrador.

Una nota en borrador puede modificarse por el Profesional que la creó, mientras no haya sido confirmada.

Restricciones:

- Las notas en borrador no se consideran nota clínica final.
- Los borradores no deben exportarse como documento clínico final.
- El sistema debe distinguir visualmente borrador y nota confirmada.

---

### F-07 Confirmar nota clínica

El Profesional puede confirmar una nota cuando considera que el contenido está completo y listo para integrarse formalmente al expediente.

Al confirmar una nota, el sistema registra fecha y hora, Profesional que confirma, estado, versión, expediente, cita y proceso asociados si aplica.

Restricciones:

- Una nota confirmada no debe modificarse por sobrescritura directa.
- Las correcciones posteriores se hacen mediante addendum.
- Solo el Profesional autorizado puede confirmar notas.

---

### F-08 Corregir nota confirmada mediante addendum

Una nota confirmada no se edita directamente.

Si el Profesional necesita corregir, aclarar o complementar una nota ya confirmada, debe crear una nota de corrección o addendum.

El addendum debe incluir nota original, motivo, contenido corregido o complementario, fecha, Profesional y referencia a versión previa.

---

### F-09 Consultar notas clínicas

El Profesional puede consultar las notas clínicas de sus Pacientes asignados o autorizados.

El sistema debe permitir filtrar por Paciente, expediente, tipo, fecha, cita, proceso, estado, autor y texto si aplica.

Restricciones:

- El contenido solo es visible para Profesionales autorizados.
- Administradores y Super Administradores no acceden al contenido clínico en operación normal.
- El Paciente no accede a notas clínicas completas en MVP.

---

### F-10 Exportar nota clínica a PDF

El Profesional puede exportar una nota clínica confirmada a PDF.

El PDF puede incluir nombre del Paciente, identificador de expediente, Profesional, cédula profesional si está registrada, tipo de nota, fecha de sesión, fecha de confirmación, contenido, organización, sello o identificador del sistema y folio interno.

Restricciones:

- Solo se exportan notas confirmadas.
- La firma digital avanzada queda fuera del MVP.
- La exportación debe quedar registrada en auditoría.

---

### F-11 Usar notas clínicas en funciones de IA

Las notas clínicas pueden formar parte del paquete clínico controlado utilizado por GPT-007 para conceptualización, tratamiento, planeación, sugerencias de intervención, evaluación y resumen terapéutico compartido.

Restricciones:

- GPT-007 no accede libremente a todas las notas clínicas.
- GPT-007 solo puede recibir notas seleccionadas, resumidas o autorizadas.
- La inclusión de notas en un paquete clínico para IA debe quedar registrada.
- El resultado generado por IA es siempre borrador.

---

### F-12 Vincular nota a proceso terapéutico

El Profesional puede vincular una nota clínica a un proceso terapéutico activo.

La vinculación permite navegar desde el expediente hacia notas, proceso, agenda y cita correspondiente.

---

### F-13 Vincular nota a sesión TCC

Cuando una nota clínica corresponde a una sesión del proceso TCC, el Profesional puede vincularla a PROCESO-TCC-006.

El sistema puede asociar la nota con:

- proceso TCC;
- número de sesión;
- fase TCC;
- objetivo de sesión;
- mecanismo clínico trabajado;
- intervención utilizada;
- tarea revisada;
- tarea asignada;
- registro de estado de ánimo;
- plan para siguiente sesión.

Restricciones:

- La nota clínica formal sigue viviendo en NOTAS-004.
- PROCESO-TCC-006 solo vincula la nota al flujo terapéutico.
- El estado de ánimo registrado en la nota puede alimentar el monitoreo del proceso TCC.
- La nota no se publica automáticamente en el portal del Paciente.

---

### F-14 Registrar nota de referencia o traslado

El Profesional puede crear una nota de referencia o traslado cuando considere necesario derivar, referir o transferir el caso a otro Profesional o servicio.

Restricciones:

- La nota no transfiere automáticamente el expediente completo.
- Cualquier transferencia de información clínica requiere autorización explícita y registro en auditoría.

---

### F-15 Registrar nota de egreso

El Profesional puede crear una nota de egreso cuando finaliza un proceso terapéutico.

La nota puede incluir motivo de egreso, resumen del proceso, objetivos trabajados, avances, estado al cierre, recomendaciones, plan de seguimiento y derivación si aplica.

---

## Estados de la nota

| Estado | Descripción |
|---|---|
| `borrador` | Nota iniciada pero no confirmada. Puede editarse. |
| `confirmada` | Nota validada por el Profesional e integrada formalmente al expediente. |
| `con_addendum` | Nota confirmada que tiene corrección o complemento vinculado. |
| `anulada_logicamente` | Nota marcada como anulada por error, sin eliminación física. |
| `exportada` | Nota confirmada que fue exportada a PDF al menos una vez. |

---

## Reglas de negocio

1. Toda nota clínica pertenece a un expediente clínico.
2. Toda nota clínica debe estar vinculada a un Paciente, expediente y Profesional.
3. No puede existir una nota clínica suelta.
4. NOTAS-004 es submódulo operativo de EXPEDIENTE-003.
5. Las notas clínicas forman parte del contenido clínico protegido.
6. El Paciente no accede a notas clínicas completas en MVP.
7. Administradores y Super Administradores no acceden al contenido de notas en operación normal.
8. El Profesional solo accede a notas de Pacientes asignados o autorizados.
9. Una nota confirmada no debe sobrescribirse directamente.
10. Toda corrección posterior debe realizarse mediante addendum.
11. Las notas clínicas no se eliminan físicamente desde operación ordinaria.
12. Solo se pueden exportar notas confirmadas.
13. Toda creación, edición, confirmación, consulta, exportación, addendum o anulación lógica debe quedar registrada.
14. Las notas pueden utilizarse por GPT-007 únicamente como parte de un paquete clínico controlado.
15. GPT-007 no tiene acceso libre, permanente ni indiscriminado a las notas.
16. La nota clínica puede mencionar resultados, interpretación y relevancia clínica de una evaluación psicológica, pero no debe reproducir instrumentos psicológicos protegidos completos.
17. Las imágenes de pruebas, inventarios o protocolos cargadas en EVAL-014 no deben copiarse dentro de la nota clínica salvo justificación clínica y autorización suficiente.
18. Si una nota utiliza resultados generados con apoyo de GPT-007 desde imágenes de evaluación, debe quedar claro que el Profesional revisó y validó el resultado antes de incorporarlo.
19. Una nota puede vincularse a una sesión TCC para alimentar seguimiento, estado de ánimo, ruta terapéutica y reevaluaciones.
20. Las notas deben redactarse con lenguaje clínico, prudente, objetivo y respetuoso.
21. Los datos de espiritualidad o vida moral solo deben registrarse cuando hayan sido compartidos libremente y sean clínicamente pertinentes.

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `note_id` | Identificador único de la nota clínica |
| `expediente_id` | Expediente clínico al que pertenece |
| `patient_id` | Paciente al que pertenece |
| `professional_id` | Profesional autor o responsable |
| `organization_id` | Organización relacionada, si aplica |
| `appointment_id` | Cita asociada, si aplica |
| `process_id` | Proceso terapéutico asociado, si aplica |
| `tcc_process_id` | Proceso TCC relacionado, si aplica |
| `tcc_session_number` | Número de sesión TCC, si aplica |
| `tcc_phase` | Fase del proceso TCC relacionada, si aplica |
| `note_type` | `admision`, `evolucion`, `interconsulta`, `referencia_traslado`, `egreso`, `addendum` |
| `status` | `borrador`, `confirmada`, `con_addendum`, `anulada_logicamente`, `exportada` |
| `session_date` | Fecha de sesión o acto clínico |
| `content` | Contenido clínico |
| `clinical_summary` | Resumen clínico breve, si aplica |
| `interventions` | Intervenciones realizadas, si aplica |
| `patient_response` | Respuesta del Paciente, si aplica |
| `plan_next_session` | Plan o acuerdos |
| `risk_flags` | Indicadores de riesgo, si aplica |
| `homework_or_tasks` | Tareas terapéuticas o acuerdos |
| `mood_score` | Estado de ánimo reportado u observado, escala 1 a 10, si aplica |
| `anxiety_score` | Ansiedad subjetiva, escala 1 a 10, si aplica |
| `hope_score` | Esperanza subjetiva, escala 1 a 10, si aplica |
| `created_by_user_id` | Usuario que creó la nota |
| `created_at` | Fecha de creación |
| `updated_at` | Fecha de última edición |
| `confirmed_by_user_id` | Usuario que confirmó |
| `confirmed_at` | Fecha de confirmación |
| `addendum_to_note_id` | Nota original de un addendum |
| `correction_reason` | Motivo de corrección |
| `annulment_reason` | Motivo de anulación lógica |
| `pdf_file_id` | PDF generado, si aplica |
| `ai_used` | Indica si hubo apoyo de IA |
| `ai_session_id` | Sesión de GPT-007 relacionada, si aplica |

---

## Auditoría

Eventos mínimos:

- creación de nota;
- edición de borrador;
- confirmación de nota;
- consulta de nota;
- creación de addendum;
- anulación lógica;
- exportación a PDF;
- vínculo con cita;
- vínculo con proceso terapéutico;
- vínculo con sesión TCC;
- uso de nota en paquete clínico para IA;
- intento de acceso no autorizado.

---

## Privacidad y seguridad

Las notas clínicas contienen información sensible y forman parte del expediente clínico.

Reglas:

- Acceso bajo mínimo privilegio.
- Visualización solo para Profesionales autorizados.
- Sin acceso para Administradores o Super Administradores en operación normal.
- Sin acceso para el Paciente en MVP.
- Sin uso en reportes administrativos individualizados.
- Sin exportación masiva en MVP.
- Sin envío automático a IA.
- Sin eliminación física ordinaria.

---

## Dependencias

- EXPEDIENTE-003 — contenedor clínico maestro.
- USERS-002 — Pacientes, Profesionales, roles y permisos.
- AGENDA-008 — citas desde las cuales pueden generarse notas.
- PROCESO-GENERAL-005 — procesos terapéuticos generales.
- PROCESO-TCC-006 — sesiones TCC, ruta terapéutica, estado de ánimo y reevaluaciones vinculadas a notas clínicas.
- EVAL-014 — evaluaciones psicológicas, imágenes autorizadas y resultados validados.
- GPT-007 — uso controlado de notas para conceptualización, tratamiento, planeación, evaluación, actualización TCC y resumen terapéutico.
- PORTAL-011 — el Paciente no ve notas clínicas completas; solo resúmenes publicados.
- ADMIN-012 — sin acceso al contenido clínico de notas.
- LOG-014 — auditoría y trazabilidad.
- PRIV-015 — privacidad, consentimiento y minimización.

---

## Fuera de alcance del MVP

- Acceso del Paciente a notas clínicas completas.
- Edición colaborativa simultánea de una nota por varios Profesionales.
- Firma electrónica avanzada.
- Eliminación física de notas clínicas.
- Exportación masiva de notas.
- Plantillas avanzadas personalizadas por organización.
- Dictado por voz.
- Transcripción automática de sesiones.
- Generación autónoma de notas clínicas por IA sin revisión humana.
- Guardado automático de notas generadas por IA.
- Publicación automática de notas en el portal del Paciente.
- Reproducción completa de pruebas psicológicas protegidas dentro de notas clínicas.
- Copia automática de imágenes de evaluaciones dentro de notas clínicas.
- Acceso administrativo al contenido clínico de notas.
