# GPT-007 — Asistente Clínico GPT

## Propósito

Proveer al Profesional un asistente clínico de inteligencia artificial para apoyar tareas clínicas supervisadas, como prellenado de campos del proceso terapéutico, generación de borradores de conceptualización de caso, planteamiento del plan de tratamiento, planeación de sesiones, generación de borradores de resumen terapéutico compartido para el Paciente, análisis de evaluaciones psicológicas por imagen, actualización de conceptualización TCC y organización de información clínica.

El asistente opera únicamente como herramienta de apoyo. No diagnostica de forma definitiva, no decide, no sustituye el juicio clínico del Profesional y no guarda contenido clínico automáticamente.

Todo contenido generado por IA debe ser revisado, corregido y aprobado por el Profesional antes de incorporarse al expediente clínico, al proceso terapéutico, al plan de tratamiento, a la planeación de sesiones, a la evaluación o al portal del Paciente.

El uso del asistente debe operar bajo consentimiento informado aplicable, principio de mínimo necesario, separación de datos de identificación, trazabilidad, auditoría y supervisión profesional.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Activa el asistente, proporciona directrices clínicas, revisa, edita, aprueba o descarta las sugerencias generadas. |
| Paciente | No interactúa directamente con el asistente en el MVP. |
| IA clínica asistida | Genera borradores clínicos bajo control del Profesional, con acceso limitado a un paquete clínico controlado. |
| Sistema | Prepara el paquete clínico controlado, separa datos identificables, registra auditoría y gestiona el flujo de aceptación o rechazo. |

---

## Principio clínico rector

El asistente clínico con IA no solo apoya la conceptualización del caso, sino también el planteamiento del tratamiento, la planeación de sesiones, el resumen terapéutico compartido, el análisis preliminar de evaluaciones psicológicas por imagen y la actualización de conceptualización y plan TCC después de cortes de reevaluación.

Toda salida de IA es un borrador supervisado, revisado y aprobado por el Profesional.

La conceptualización de caso es una formulación clínica que organiza la información del expediente, notas de sesiones, pruebas psicológicas y directrices del Profesional para identificar mecanismos originadores y mantenedores de la problemática, explicar cómo se organiza el sufrimiento actual del Paciente y orientar el plan de tratamiento.

---

## Funcionalidades

### F-01 Activar asistente clínico

El Profesional puede activar el asistente clínico con IA desde distintos contextos del sistema:

1. Desde un paso activo del proceso terapéutico.
2. Desde el expediente clínico, seleccionando **"Conceptualizar caso con IA"**.
3. Desde una conceptualización aprobada o en borrador, seleccionando **"Plantear tratamiento con IA"**.
4. Desde un plan de tratamiento aprobado o en borrador, seleccionando **"Planear sesión con IA"**.
5. Desde una nota de sesión o seguimiento, para apoyar la continuidad clínica.
6. Desde el expediente o portal profesional, seleccionando **"Generar resumen terapéutico para el Paciente con IA"**.
7. Desde EVAL-014, seleccionando **"Analizar evaluación con IA"**.
8. Desde PROCESO-TCC-006, seleccionando **"Actualizar conceptualización TCC con IA"**.

Restricciones:

- El asistente solo puede ser activado por un Profesional autorizado.
- El Paciente no interactúa directamente con el asistente.
- La IA no guarda automáticamente contenido clínico.
- La IA no modifica expedientes, procesos, notas, planes, evaluaciones, agenda ni portal por sí misma.
- Toda activación debe quedar registrada en auditoría.

---

### F-02 Escribir directrices clínicas para IA

Antes de ejecutar una función clínica asistida por IA, el sistema debe permitir que el Profesional agregue directrices clínicas, comentarios, observaciones o énfasis terapéuticos.

Estas directrices pueden incluir:

- aspectos observados durante la entrevista clínica;
- hipótesis iniciales del Profesional;
- dudas clínicas;
- posibles contradicciones detectadas;
- factores espirituales, familiares, relacionales o personales relevantes;
- modelo terapéutico a utilizar;
- indicaciones sobre tono clínico;
- límites sobre lo que la IA no debe asumir;
- objetivos concretos de la consulta a IA;
- criterios de interpretación o puntos de corte en evaluaciones psicológicas, cuando aplique.

Las directrices del Profesional forman parte del paquete clínico controlado para esa solicitud.

---

### F-03 Prellenar campos del proceso terapéutico

Dentro de un paso activo del proceso terapéutico, el Profesional puede activar el asistente GPT para recibir sugerencias de prellenado.

El asistente puede trabajar con:

- tipo de proceso terapéutico;
- modelo terapéutico utilizado;
- paso actual;
- campos del paso actual;
- pasos previos completados;
- instrucciones previas del Profesional;
- directrices clínicas agregadas para esa solicitud.

El Profesional puede aceptar, editar, rechazar o descartar la sugerencia.

Restricciones:

- Solo el Profesional puede guardar contenido.
- No existe guardado automático desde GPT.
- El sistema debe conservar trazabilidad de si el contenido guardado tuvo origen en una sugerencia de IA.

---

### F-04 Conceptualizar caso con IA

El Profesional puede solicitar apoyo de IA para generar un borrador de conceptualización clínica del caso seleccionando **"Conceptualizar caso con IA"**.

La IA trabajará con tres fuentes controladas:

1. Expediente clínico del Paciente, según campos autorizados.
2. Notas de sesiones previas, cuando la conceptualización sea posterior a la primera sesión.
3. Directrices clínicas agregadas por el Profesional.

Para conceptualización asistida por IA, "expediente" significa:

**expediente clínico + notas de sesiones disponibles y autorizadas + directrices clínicas del Profesional.**

El paquete clínico puede incluir motivo de consulta, historia del problema, antecedentes, diagnósticos previos, resultados de pruebas psicológicas, notas seleccionadas o resumidas, evolución, factores de riesgo, factores protectores, objetivos, contexto familiar, relacional y espiritual cuando sea pertinente.

La IA debe generar una conceptualización estructurada que incluya:

- historia sintética del caso;
- motivo de consulta;
- síntomas emocionales, cognitivos, conductuales y fisiológicos;
- antecedentes relevantes;
- resultados relevantes de pruebas psicológicas;
- hipótesis diagnósticas cuando aplique;
- factores precipitantes;
- mecanismos originadores;
- mecanismos mantenedores;
- formulación transversal y longitudinal;
- creencias centrales, intermedias y pensamientos automáticos;
- patrones conductuales que mantienen el problema;
- factores protectores;
- hipótesis de trabajo;
- lista de problemas;
- objetivos terapéuticos;
- plan de tratamiento sugerido;
- intervenciones sugeridas;
- obstáculos previsibles;
- criterios de monitoreo y progreso.

Restricciones:

- La IA no emite diagnóstico definitivo.
- La IA no sustituye el juicio clínico del Profesional.
- La IA no accede libremente al expediente completo.
- El resultado generado es borrador.
- El Profesional debe revisar, corregir y aprobar antes de guardar.

---

### F-05 Identificar mecanismos originadores y mantenedores

Dentro de la conceptualización, la IA debe distinguir entre mecanismos originadores y mecanismos mantenedores.

Los mecanismos originadores explican cómo se formó la vulnerabilidad clínica. Pueden incluir experiencias tempranas, invalidación emocional, estilos de apego, aprendizajes familiares, esquemas, creencias centrales, experiencias traumáticas, historia espiritual o moral relevante y patrones de afrontamiento aprendidos.

Los mecanismos mantenedores explican por qué el problema sigue activo en el presente. Pueden incluir pensamientos automáticos, creencias activadas, evitación, rumiación, autocrítica, baja activación conductual, inhibición emocional, conflictos relacionales, falta de límites, síntomas fisiológicos e intentos de solución que mantienen el problema.

Restricciones:

- La IA debe diferenciar hechos reportados, inferencias e hipótesis.
- La IA debe señalar información faltante.
- La IA debe evitar lenguaje moralizante o reduccionista.

---

### F-06 Guardar conceptualización aprobada

El Profesional puede descartar, editar, corregir, complementar, aprobar y guardar el borrador como conceptualización clínica.

Restricciones:

- La conceptualización guardada debe indicar que fue revisada y aprobada por el Profesional.
- El sistema debe diferenciar borrador generado por IA, versión editada y versión aprobada.
- La responsabilidad clínica corresponde al Profesional que aprueba.

---

### F-07 Plantear tratamiento con IA

El Profesional puede solicitar apoyo de IA para generar un borrador de plan de tratamiento a partir de la conceptualización.

El plan debe derivarse de los mecanismos identificados.

La IA puede proponer objetivos generales, objetivos específicos, objetivos instrumentales, medios de evaluación, fases, técnicas, tareas terapéuticas, criterios de avance, indicadores de riesgo, derivación o supervisión y monitoreo.

Restricciones:

- El plan no puede ser genérico.
- Cada intervención debe vincularse con mecanismos de la conceptualización.
- El Profesional debe revisar, corregir y aprobar.

---

### F-08 Planear sesión con IA

El Profesional puede solicitar apoyo para planear una sesión individual o una secuencia de sesiones.

La planeación debe derivarse de conceptualización, mecanismos prioritarios, plan de tratamiento, notas previas, avances, tareas, dificultades y directrices del Profesional.

La IA puede generar objetivo de sesión, mecanismo a trabajar, estructura, preguntas clínicas, técnica principal, técnica secundaria, tarea para casa, obstáculos, criterio de avance y seguimiento.

Restricciones:

- La IA no conduce la sesión.
- La IA no interactúa con el Paciente.
- La planeación es borrador y debe ser aprobada por el Profesional.

---

### F-09 Sugerir intervenciones clínicas

La IA puede sugerir intervenciones clínicas relacionadas con activación conductual, reestructuración cognitiva, diálogo socrático, experimentos conductuales, exposición cuando aplique, resolución de problemas, psicoeducación, regulación emocional, clarificación de valores, límites, prevención de recaídas, factores protectores e integración prudente de recursos espirituales.

Restricciones:

- Deben ser congruentes con el modelo terapéutico elegido.
- Deben vincularse con la conceptualización.
- La IA debe señalar cuando se requiere supervisión, derivación o atención urgente.

---

### F-10 Generar resumen terapéutico compartido para el Paciente

El Profesional puede solicitar a la IA un borrador de resumen terapéutico compartido para el Paciente.

Este resumen está destinado a ser visible en PORTAL-011, por lo que debe estar redactado en lenguaje claro, prudente, respetuoso y clínicamente responsable.

Puede incluir objetivos comunicables, acuerdos de seguimiento, tareas generales, pautas psicoeducativas, recursos personales, recursos espirituales o comunitarios cuando sean pertinentes y próximos pasos.

Restricciones:

- No debe incluir notas internas.
- No debe incluir hipótesis clínicas no comunicadas.
- No debe incluir conceptualización interna completa.
- No debe incluir diagnósticos no explicados previamente.
- No debe incluir información de terceros.
- No debe incluir resultados completos de pruebas psicológicas.
- No se publica automáticamente.
- El Paciente nunca ve borradores de IA.

---

### F-11 Analizar evaluación psicológica por imagen

El Profesional puede solicitar a la IA apoyo para analizar imágenes de hojas, inventarios, protocolos o resultados de evaluaciones psicológicas.

Para iniciar esta función, el Profesional selecciona:

**"Analizar evaluación con IA"**

El sistema permite cargar imágenes proporcionadas por el Profesional.

Estas imágenes pueden incluir:

- hoja de respuestas;
- inventario contestado;
- protocolo aplicado;
- tabla de puntajes;
- captura de resultados;
- hoja escaneada;
- fotografía de formato físico;
- reporte externo autorizado.

La IA puede apoyar en:

- lectura de información visible;
- extracción de respuestas;
- organización de respuestas;
- sumatoria de puntajes;
- cálculo de subtotales;
- identificación de escalas;
- estructuración de resultados;
- redacción de interpretación preliminar;
- integración de resultados a conceptualización;
- sugerencia de implicaciones terapéuticas.

Restricciones:

- La IA no sustituye el manual de la prueba.
- La IA no sustituye el juicio clínico del Profesional.
- La IA no emite diagnóstico definitivo.
- La IA no debe inventar puntos de corte, baremos o normas.
- El Profesional debe proporcionar puntos de corte, baremos o criterios cuando sean necesarios.
- El sistema no debe almacenar pruebas completas como banco de instrumentos.
- Las imágenes se tratan como contenido clínico protegido.
- Las imágenes deben usarse preferentemente como insumo temporal de análisis.
- El resultado generado por IA es borrador.
- El Profesional debe revisar, corregir y aprobar antes de incorporar al expediente.
- Toda carga y análisis de imagen debe quedar registrada en auditoría.

---

### F-12 Actualizar conceptualización y plan TCC

El Profesional puede solicitar a la IA apoyo para actualizar la conceptualización TCC y el plan de tratamiento después de un corte de reevaluación.

Para iniciar esta función, el Profesional selecciona:

**"Actualizar conceptualización TCC con IA"**

La IA puede trabajar con un paquete clínico controlado que incluya:

- conceptualización TCC vigente;
- versiones previas de conceptualización;
- plan de tratamiento vigente;
- ruta terapéutica por sesiones;
- notas clínicas seleccionadas o resumidas;
- resultados validados de evaluaciones psicológicas;
- registros de estado de ánimo;
- tareas realizadas o no realizadas;
- avances observados;
- obstáculos clínicos;
- directrices clínicas del Profesional.

La IA puede generar:

- resumen de evolución;
- cambios detectados en mecanismos mantenedores;
- mecanismos de cambio activados;
- hipótesis que se fortalecen;
- hipótesis que deben revisarse;
- objetivos que deben mantenerse;
- objetivos que deben ajustarse;
- intervenciones sugeridas;
- ajustes al plan de tratamiento;
- propuesta de siguientes sesiones;
- criterios de seguimiento.

Restricciones:

- La IA no modifica automáticamente la conceptualización.
- La IA no modifica automáticamente el plan de tratamiento.
- La IA no reprograma citas automáticamente.
- El resultado generado es borrador.
- El Profesional debe revisar, corregir y aprobar antes de guardar.
- Toda actualización asistida por IA debe quedar registrada en auditoría.

---

### F-13 Recibir, revisar y validar sugerencias

Toda sugerencia generada por IA debe presentarse como borrador editable.

El Profesional puede aceptar, editar, complementar, rechazar o descartar.

Reglas:

- No existe guardado automático desde IA.
- Solo el Profesional puede guardar contenido clínico.
- Solo el Profesional puede publicar contenido visible para el Paciente.
- El sistema debe registrar si el contenido guardado o publicado provino total o parcialmente de IA.

---

## Restricciones de privacidad

GPT puede acceder únicamente al paquete clínico controlado preparado para la tarea solicitada.

Para análisis de evaluaciones psicológicas por imagen, GPT puede acceder a:

- imágenes cargadas explícitamente por el Profesional para esa solicitud;
- nombre de la prueba o inventario, si el Profesional lo proporciona;
- instrucciones clínicas del Profesional;
- puntos de corte o criterios proporcionados por el Profesional;
- contexto clínico mínimo necesario;
- resultados ya registrados, si aplica.

Para actualización de conceptualización y plan TCC, GPT puede acceder a:

- conceptualización TCC vigente y versiones previas;
- plan de tratamiento vigente;
- ruta terapéutica por sesiones;
- notas clínicas seleccionadas o resumidas;
- evaluaciones validadas;
- registros de estado de ánimo;
- corte de reevaluación relacionado;
- directrices clínicas del Profesional.

GPT no puede acceder a:

- banco interno de pruebas;
- manuales completos;
- reactivos almacenados como plantilla del sistema;
- claves de corrección protegidas almacenadas como recurso interno;
- imágenes de evaluaciones no autorizadas para la tarea;
- evaluaciones de otros Pacientes;
- datos de identificación directa innecesarios.

---

## Paquete clínico controlado

Antes de llamar a la API, el sistema debe construir un paquete clínico limitado a la tarea solicitada.

El paquete puede incluir tipo de tarea, modelo terapéutico, campos a completar, datos clínicos necesarios, notas seleccionadas o resumidas, resultados de pruebas relevantes, conceptualización, plan de tratamiento, imágenes autorizadas, registros de estado de ánimo y directrices del Profesional.

El paquete debe excluir datos de identificación directa que no sean necesarios.

---

## Flujo general de uso

```text
1. Profesional selecciona una función de IA:
   - prellenar paso;
   - conceptualizar caso;
   - plantear tratamiento;
   - planear sesión;
   - sugerir intervención;
   - generar resumen terapéutico compartido;
   - analizar evaluación psicológica por imagen;
   - actualizar conceptualización y plan TCC.

2. Sistema abre formulario de directrices clínicas.
3. Profesional agrega comentarios, hipótesis, observaciones o instrucciones.
4. Sistema construye paquete clínico controlado.
5. Sistema excluye datos identificables innecesarios.
6. IA genera borrador.
7. Profesional revisa, edita, aprueba, rechaza o descarta.
8. Solo el contenido aprobado por el Profesional puede guardarse o publicarse.
9. Sistema registra auditoría del proceso.
```

---

## Reglas de negocio

1. El asistente solo puede ser activado por un Profesional autorizado.
2. El Paciente no interactúa directamente con el asistente de IA en el MVP.
3. El uso de IA sobre información clínica requiere consentimiento informado aplicable y aviso de privacidad compatible.
4. Las sugerencias de IA no tienen valor clínico hasta que el Profesional las revisa y guarda explícitamente.
5. La IA no emite diagnósticos definitivos.
6. La IA no sustituye el juicio clínico del Profesional.
7. La IA no puede crear, modificar ni eliminar notas clínicas por sí misma.
8. No existe guardado automático desde IA hacia expediente, proceso, plan, sesión, evaluación, agenda o portal.
9. El Profesional puede aceptar, editar, rechazar o descartar sugerencias.
10. Para conceptualización, el sistema trabaja con expediente clínico + notas de sesiones disponibles y autorizadas + directrices clínicas del Profesional.
11. El sistema debe construir un paquete clínico controlado antes de llamar a la IA.
12. Toda activación debe quedar registrada en auditoría.
13. El proveedor inicial será OpenAI mediante API o modalidad empresarial adecuada.
14. No se permite copiar y pegar información clínica en cuentas personales de chat para operación real del sistema.
15. Catholizare debe revisar privacidad, retención, DPA, términos y controles del proveedor antes de usar datos reales.
16. Toda planeación generada por IA debe estar vinculada a la conceptualización.
17. La IA debe mantener lenguaje clínico, prudente, respetuoso y no moralizante.
18. La IA puede apoyar el análisis de evaluaciones psicológicas mediante imágenes cargadas por el Profesional.
19. Catholizare OS no almacena bancos de pruebas psicológicas, reactivos, manuales ni claves de corrección protegidas.
20. El Profesional es responsable de contar con licencia, autorización o derecho de uso del instrumento aplicado.
21. La IA no debe inventar baremos, puntos de corte ni criterios psicométricos.
22. Los resultados de evaluación generados por IA son borradores hasta que el Profesional los revise y valide.
23. Las imágenes de evaluaciones se tratan como contenido clínico protegido y deben usarse con mínimo necesario.
24. La IA puede apoyar la actualización de conceptualización TCC y plan de tratamiento después de cortes de reevaluación.
25. La IA puede sugerir ajustes a próximas sesiones, pero no modifica agenda ni plan terapéutico sin aprobación del Profesional.
26. Los registros de estado de ánimo pueden utilizarse como insumo clínico dentro del paquete controlado, pero no sustituyen evaluación psicológica formal.

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `ai_session_id` | Identificador de la sesión de consulta al asistente |
| `professional_id` | Profesional que activa el asistente |
| `patient_id` | Paciente relacionado; no enviado necesariamente a la IA |
| `expediente_id` | Expediente relacionado, si aplica |
| `process_id` | Proceso terapéutico en el que se activó, si aplica |
| `tcc_process_id` | Proceso TCC relacionado, si aplica |
| `step_id` | Paso del proceso en el que se activó, si aplica |
| `assessment_id` | Evaluación psicológica relacionada, si aplica |
| `reevaluation_cut_id` | Corte de reevaluación relacionado, si aplica |
| `ai_function_type` | `prellenado_paso`, `conceptualizacion_caso`, `plan_tratamiento`, `planeacion_sesion`, `sugerencia_intervencion`, `resumen_terapeutico_paciente`, `analisis_evaluacion_imagen`, `actualizacion_conceptualizacion_tcc` |
| `clinical_context_package` | Paquete clínico controlado preparado para la IA |
| `uploaded_image_ids` | Imágenes cargadas para análisis, si aplica |
| `included_session_notes` | Referencias a notas incluidas, seleccionadas o resumidas |
| `included_assessments` | Referencias a evaluaciones o pruebas incluidas |
| `mood_tracking_entries` | Registros de estado de ánimo incluidos en el paquete clínico, si aplica |
| `professional_directives` | Directrices clínicas agregadas por el Profesional |
| `model_provider` | Proveedor del modelo |
| `model_name` | Modelo utilizado |
| `suggested_content` | Contenido generado por IA |
| `image_analysis_result` | Resultado preliminar generado a partir de imágenes, si aplica |
| `professional_decision` | `aceptado`, `editado`, `rechazado`, `descartado` |
| `published_to_patient_portal` | Indica si el contenido aprobado fue publicado en el portal |
| `accepted_at` | Timestamp de aceptación, si aplica |
| `created_at` | Timestamp de creación |
| `updated_at` | Timestamp de última actualización |

---

## Auditoría

Toda interacción con el asistente debe registrar usuario, rol, fecha, expediente, proceso o evaluación relacionada, función utilizada, modelo, paquete clínico construido, notas o pruebas incluidas, directrices, resultado generado, decisión final y publicación si aplica.

Restricciones:

- El log no debe exponer innecesariamente contenido clínico sensible.
- El log no debe convertirse en copia paralela del expediente.
- Los logs no pueden editarse ni eliminarse desde operación ordinaria.

---

## Dependencias

- EXPEDIENTE-003 — expediente clínico, historia clínica, notas, pruebas, conceptualización y resumen terapéutico compartido.
- NOTAS-004 — notas clínicas disponibles y autorizadas.
- EVAL-014 — evaluaciones psicológicas, carga de imágenes y resultados validados.
- PROCESO-GENERAL-005 — procesos terapéuticos generales.
- PROCESO-TCC-006 — proceso TCC, conceptualización, plan, ruta terapéutica, estado de ánimo y reevaluaciones.
- AGENDA-008 — citas y sesiones relacionadas.
- PORTAL-011 — visualización del resumen terapéutico compartido aprobado.
- ADMIN-012 — sin acceso al contenido clínico generado por IA.
- LOG-014 — auditoría y trazabilidad.
- PRIV-015 — privacidad, consentimiento, minimización y tratamiento de datos.
- API de OpenAI — proveedor inicial del modelo en MVP.

---

## Fuera de alcance del MVP

- Chatbot de atención directa al Paciente.
- Diagnóstico autónomo por IA.
- Sustitución del juicio clínico del Profesional.
- Generación autónoma de notas clínicas sin revisión humana.
- Guardado automático de contenido generado por IA.
- Publicación automática de contenido generado por IA en el portal del Paciente.
- Modificación automática del expediente por IA.
- Modificación automática del plan TCC por IA.
- Reprogramación automática de citas por IA.
- Análisis de riesgo automatizado sin supervisión clínica.
- Integración con modelos de lenguaje distintos a OpenAI en el MVP.
- Uso de cuentas personales de chat para procesar información clínica real.
- Entrenamiento personalizado del modelo con expedientes clínicos reales.
- Acceso de Administradores o Super Administradores al contenido clínico generado por IA.
- Interacción directa de IA con pacientes.
- Banco interno de pruebas psicológicas protegidas.
- Almacenamiento de manuales completos de pruebas.
- Almacenamiento de reactivos protegidos como plantillas del sistema.
- Calificación definitiva de pruebas sin validación profesional.
