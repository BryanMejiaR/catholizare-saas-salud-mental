# GPT-007 — Asistente Clínico GPT

## Propósito

Proveer al Profesional un asistente clínico de inteligencia artificial para apoyar tareas clínicas supervisadas, como prellenado de campos del proceso terapéutico, generación de borradores de conceptualización de caso, planteamiento del plan de tratamiento, planeación de sesiones, generación de borradores de resumen terapéutico compartido para el Paciente, análisis de evaluaciones psicológicas por imagen, organización de información clínica y sugerencias de líneas de intervención.

El asistente opera únicamente como herramienta de apoyo. No diagnostica de forma definitiva, no decide, no sustituye el juicio clínico del Profesional y no guarda contenido clínico automáticamente.

Todo contenido generado por IA debe ser revisado, corregido y aprobado por el Profesional antes de incorporarse al expediente clínico, al proceso terapéutico, al plan de tratamiento, a la planeación de sesiones, a resultados de evaluación psicológica o al portal del Paciente.

El uso del asistente debe operar bajo consentimiento informado aplicable, principio de mínimo necesario, separación de datos de identificación, trazabilidad, auditoría y supervisión profesional.

La IA debe ayudar al Profesional a pasar de información clínica dispersa a una formulación organizada del caso, identificando mecanismos originadores y mantenedores, y derivando de ellos objetivos, plan de tratamiento y planeación de sesiones.

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

El asistente clínico con IA no solo apoya la conceptualización del caso, sino también el planteamiento del tratamiento, la planeación de sesiones, la elaboración de resúmenes terapéuticos compartidos y el análisis preliminar de evaluaciones psicológicas, siempre como borradores clínicos supervisados, revisados y aprobados por el Profesional.

La conceptualización de caso es una formulación clínica que organiza la información del expediente, notas de sesiones, pruebas psicológicas y directrices del Profesional para identificar los mecanismos originadores y mantenedores de la problemática, explicar cómo se organiza el sufrimiento actual del Paciente y orientar el plan de tratamiento.

La conceptualización no se reduce a diagnóstico ni a resumen narrativo. Su función principal es explicar:

- qué originó o predispuso la vulnerabilidad clínica;
- qué mantiene actualmente el problema;
- qué recursos protegen al Paciente;
- qué ruta terapéutica conviene seguir;
- qué objetivos deben trabajarse;
- qué intervenciones son coherentes con la formulación del caso.

---

## Funcionalidades

### F-01 Activar asistente clínico

El Profesional puede activar el asistente clínico con IA desde distintos contextos del sistema:

1. Desde un paso activo del proceso terapéutico, para recibir sugerencias de prellenado o apoyo en el desarrollo del paso.
2. Desde el expediente clínico, seleccionando la acción **“Conceptualizar caso con IA”**.
3. Desde una conceptualización aprobada o en borrador, seleccionando la acción **“Plantear tratamiento con IA”**.
4. Desde un plan de tratamiento aprobado o en borrador, seleccionando la acción **“Planear sesión con IA”**.
5. Desde una nota de sesión o seguimiento, para apoyar la continuidad clínica, siempre bajo revisión profesional.
6. Desde el expediente o portal profesional, seleccionando la acción **“Generar resumen terapéutico para el Paciente con IA”**.
7. Desde EVAL-014, seleccionando la acción **“Analizar evaluación con IA”**.

En todos los casos, el Profesional conserva el control clínico del contenido generado.

Restricciones:

- El asistente solo puede ser activado por un Profesional autorizado.
- El Paciente no interactúa directamente con el asistente.
- La IA no guarda automáticamente contenido clínico.
- La IA no modifica expedientes, procesos, notas, evaluaciones ni planes por sí misma.
- La IA no publica automáticamente contenido en el portal del Paciente.
- Toda activación debe quedar registrada en auditoría.

---

### F-02 Escribir directrices clínicas para IA

Antes de ejecutar una función clínica asistida por IA, el sistema debe permitir que el Profesional agregue directrices clínicas, comentarios, observaciones o énfasis terapéuticos.

Estas directrices pueden incluir:

- aspectos observados durante la entrevista clínica;
- hipótesis iniciales del Profesional;
- elementos relevantes del lenguaje verbal o no verbal del Paciente;
- dudas clínicas;
- posibles contradicciones detectadas;
- factores espirituales, familiares, relacionales o personales relevantes;
- temas que el Profesional desea explorar con mayor profundidad;
- advertencias sobre información que debe interpretarse con prudencia;
- modelo terapéutico a utilizar, por ejemplo TCC, sistémico, integrativo, humanista, psicodinámico o antropológico-personalista;
- indicaciones sobre el tono clínico deseado;
- límites sobre lo que la IA no debe asumir;
- objetivos concretos de la consulta a IA;
- puntos de corte o criterios de interpretación de evaluación psicológica, cuando aplique.

Ejemplos de directrices:

- “El paciente presenta alta resistencia al cambio.”
- “Enfocar la conceptualización en el eje de creencias nucleares de abandono.”
- “Distinguir miedo realista de creencia de incompetencia.”
- “Explorar mecanismos mantenedores relacionados con evitación y autocrítica.”
- “Preparar un plan de tratamiento desde TCC.”
- “Integrar la dimensión espiritual solo como factor protector, no como explicación simplista del problema.”
- “Evitar lenguaje moralizante.”
- “Mantener enfoque clínico y antropológico-personalista.”
- “Redactar un resumen para el Paciente en lenguaje claro y esperanzador, sin revelar hipótesis internas.”
- “Analizar esta hoja de respuestas usando los puntos de corte que proporcionaré.”

Las directrices del Profesional forman parte del paquete clínico controlado para esa solicitud.

---

### F-03 Prellenar campos del proceso terapéutico

Dentro de un paso activo del proceso terapéutico, el Profesional puede activar el asistente GPT para recibir sugerencias de prellenado.

El asistente puede trabajar con:

- tipo de proceso terapéutico;
- modelo terapéutico utilizado;
- paso actual;
- campos del paso actual;
- pasos previos completados del mismo proceso;
- instrucciones previas del Profesional;
- directrices clínicas agregadas para esa solicitud.

La IA puede sugerir contenido para:

- hipótesis clínicas;
- objetivos del paso;
- descripción de avances;
- preguntas clínicas;
- tareas terapéuticas;
- observaciones estructuradas;
- posibles intervenciones;
- criterios de seguimiento.

Las sugerencias se presentan como texto editable en la interfaz, visualmente diferenciadas del contenido validado, por ejemplo con etiqueta **“Sugerencia GPT”**.

El Profesional puede:

- aceptar la sugerencia tal como está;
- editar la sugerencia antes de guardarla;
- rechazarla completamente;
- descartarla sin guardar.

Restricciones:

- Solo el Profesional puede guardar contenido en los campos del proceso terapéutico.
- No existe guardado automático desde GPT.
- Una vez guardado por el Profesional, el contenido tiene carácter clínico y queda registrado con timestamp e ID del Profesional.
- El sistema debe conservar trazabilidad de si el contenido guardado tuvo origen en una sugerencia de IA.

---

### F-04 Conceptualizar caso con IA

El Profesional puede solicitar apoyo de IA para generar un borrador de conceptualización clínica del caso.

Para iniciar esta función, el Profesional selecciona la acción:

**“Conceptualizar caso con IA”**

Al seleccionar esta acción, el sistema debe abrir un formulario donde el Profesional pueda agregar directrices, comentarios clínicos, observaciones de entrevista o énfasis que considere relevantes para orientar el análisis de la IA.

La IA trabajará con tres fuentes controladas:

1. **Expediente clínico del Paciente**, según los campos autorizados para esta función.
2. **Notas de sesiones previas**, cuando la conceptualización se realice después de la primera sesión o en una etapa posterior del proceso terapéutico.
3. **Directrices clínicas agregadas por el Profesional**, incluyendo observaciones de entrevista, hipótesis iniciales, dudas clínicas, énfasis terapéuticos o indicaciones sobre el modelo de intervención.

Para conceptualización asistida por IA, el término “expediente” debe entenderse como:

**expediente clínico + notas de sesiones disponibles y autorizadas + directrices clínicas del Profesional.**

El paquete clínico para conceptualización puede incluir:

- motivo de consulta;
- historia del problema;
- antecedentes personales relevantes;
- antecedentes familiares relevantes;
- antecedentes psicológicos;
- antecedentes psiquiátricos;
- antecedentes médicos relevantes;
- diagnósticos previos;
- resultados de pruebas psicológicas;
- resultados de pruebas de personalidad;
- notas de sesiones seleccionadas o resumidas;
- evolución observada durante el proceso;
- síntomas emocionales;
- síntomas cognitivos;
- síntomas conductuales;
- síntomas fisiológicos;
- factores de riesgo;
- factores protectores;
- objetivos terapéuticos ya definidos;
- contexto familiar;
- contexto relacional;
- contexto laboral o académico;
- contexto espiritual o religioso, cuando sea clínicamente pertinente y haya sido compartido por el Paciente;
- directrices, comentarios y observaciones agregadas por el Profesional.

La IA debe generar una conceptualización clínica estructurada que incluya:

- historia sintética del caso;
- información clínica relevante;
- motivo de consulta;
- descripción del problema actual;
- síntomas emocionales, cognitivos, conductuales y fisiológicos;
- antecedentes relevantes;
- resultados relevantes de pruebas psicológicas;
- hipótesis diagnósticas, cuando aplique;
- factores precipitantes;
- mecanismos originadores de la problemática;
- mecanismos mantenedores actuales;
- formulación transversal del problema;
- formulación longitudinal del problema;
- creencias centrales, creencias intermedias y pensamientos automáticos relevantes;
- patrones conductuales que mantienen el problema;
- intentos de solución que mantienen la problemática;
- factores protectores;
- recursos psicológicos, relacionales y espirituales;
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
- La IA solo trabaja con el paquete clínico controlado, las notas de sesiones permitidas y las directrices agregadas por el Profesional.
- La IA no guarda automáticamente sus resultados en el expediente.
- El resultado generado por IA se considera borrador clínico.
- El Profesional debe revisar, corregir y aprobar cualquier contenido antes de incorporarlo al expediente.
- Toda solicitud de conceptualización asistida por IA debe quedar registrada en auditoría.
- El sistema debe registrar qué datos fueron enviados a la IA, qué notas de sesión fueron incluidas, qué directrices agregó el Profesional, qué usuario solicitó el análisis, fecha, hora, modelo utilizado y resultado generado.

---

### F-05 Identificar mecanismos originadores y mantenedores

Dentro de la conceptualización asistida por IA, el sistema debe orientar al asistente para distinguir explícitamente entre mecanismos originadores y mecanismos mantenedores.

Los mecanismos originadores ayudan a explicar cómo se formó la vulnerabilidad clínica.

Pueden incluir:

- experiencias tempranas significativas;
- heridas afectivas;
- experiencias de desprotección;
- invalidación emocional;
- estilos de apego;
- aprendizajes familiares;
- modelos de relación;
- esquemas tempranos;
- creencias centrales;
- experiencias traumáticas;
- historia espiritual o moral relevante;
- eventos vitales formativos;
- patrones de afrontamiento aprendidos.

Los mecanismos mantenedores explican por qué el problema sigue activo en el presente.

Pueden incluir:

- pensamientos automáticos;
- creencias nucleares activadas;
- evitación;
- rumiación;
- autocrítica;
- baja activación conductual;
- inhibición emocional;
- procrastinación;
- conflictos relacionales;
- falta de límites;
- ambientes laborales, familiares o conyugales invalidantes;
- síntomas fisiológicos;
- reforzamiento negativo;
- intentos de solución que mantienen el problema;
- dinámicas espirituales mal integradas, como culpa rígida, falsa resignación, escrupulosidad o evitación espiritual.

Restricciones:

- La IA debe diferenciar entre hechos reportados, inferencias clínicas e hipótesis.
- La IA debe evitar afirmar como hecho aquello que solo es hipótesis.
- La IA debe señalar qué información falta para fortalecer la conceptualización.
- La IA debe evitar explicaciones reduccionistas, moralizantes o espiritualmente simplistas.
- La IA debe mantener una perspectiva clínica respetuosa de la dignidad del Paciente.

---

### F-06 Guardar conceptualización aprobada

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

### F-07 Plantear tratamiento con IA

El Profesional puede solicitar apoyo de IA para generar un borrador de plan de tratamiento a partir de la conceptualización clínica del caso.

Para iniciar esta función, el Profesional selecciona la acción:

**“Plantear tratamiento con IA”**

El plan de tratamiento debe derivarse de los mecanismos identificados en la conceptualización.

La IA puede trabajar con un paquete clínico controlado que incluya:

- expediente clínico autorizado;
- motivo de consulta;
- historia del problema;
- conceptualización del caso aprobada o en borrador;
- mecanismos originadores identificados;
- mecanismos mantenedores identificados;
- diagnósticos previos o hipótesis diagnósticas;
- resultados de pruebas psicológicas;
- resultados de pruebas de personalidad;
- notas de sesiones disponibles y autorizadas;
- evolución del proceso, si aplica;
- factores de riesgo;
- factores protectores;
- objetivos terapéuticos ya definidos;
- directrices clínicas agregadas por el Profesional;
- modelo terapéutico elegido por el Profesional.

La IA puede proponer:

- objetivo general del tratamiento;
- objetivos específicos;
- objetivos instrumentales;
- medios de evaluación;
- prioridades clínicas;
- fases del tratamiento;
- intervenciones recomendadas;
- técnicas sugeridas;
- tareas terapéuticas;
- criterios de avance;
- posibles obstáculos;
- indicadores de riesgo;
- indicadores de derivación o supervisión;
- monitoreo de progreso;
- criterios para ajustar el plan.

Restricciones:

- El plan no puede ser genérico.
- Cada intervención sugerida debe vincularse con uno o más mecanismos identificados en la conceptualización.
- La IA no define el tratamiento de forma autónoma.
- La IA no prescribe intervenciones de manera obligatoria.
- El plan generado es un borrador clínico.
- El Profesional debe revisar, corregir y aprobar el plan antes de guardarlo.
- Toda generación de plan de tratamiento con IA debe quedar registrada en auditoría.

---

### F-08 Planear sesión con IA

El Profesional puede solicitar apoyo de IA para planear una sesión individual o una secuencia de sesiones.

Para iniciar esta función, el Profesional selecciona una de las siguientes acciones:

**“Planear próxima sesión con IA”**

o

**“Planear secuencia de sesiones con IA”**

La planeación debe derivarse de:

- conceptualización clínica;
- mecanismos mantenedores prioritarios;
- plan de tratamiento;
- notas de sesiones previas;
- avances o dificultades recientes;
- tareas asignadas previamente;
- dificultades observadas por el Profesional;
- directrices clínicas del Profesional.

La IA puede generar:

- objetivo de la sesión;
- mecanismo clínico a trabajar;
- estructura sugerida de la sesión;
- preguntas clínicas;
- técnica principal;
- técnica secundaria;
- tarea para casa;
- posible resistencia u obstáculo;
- criterio para evaluar avance;
- indicaciones de seguimiento;
- recomendaciones para ajustar el plan;
- sugerencias de integración prudente entre psicología y vida espiritual, cuando aplique.

Restricciones:

- La IA no conduce la sesión.
- La IA no interactúa directamente con el Paciente.
- La IA no sustituye la prudencia clínica del Profesional.
- El Profesional puede aceptar, editar, rechazar o descartar la planeación sugerida.
- La planeación generada no se guarda automáticamente en el expediente.
- Si se guarda, queda registrada como contenido revisado y aprobado por el Profesional.
- Toda planeación generada por IA debe quedar vinculada al expediente, proceso terapéutico o plan de tratamiento correspondiente, según aplique.

---

### F-09 Sugerir intervenciones clínicas

El Profesional puede solicitar a la IA sugerencias de intervención clínica para un caso, un mecanismo específico o una sesión determinada.

La IA puede sugerir intervenciones relacionadas con:

- activación conductual;
- reestructuración cognitiva;
- diálogo socrático;
- experimentos conductuales;
- exposición, cuando aplique;
- resolución de problemas;
- psicoeducación;
- regulación emocional;
- clarificación de valores;
- trabajo con límites;
- prevención de recaídas;
- fortalecimiento de factores protectores;
- integración prudente de recursos espirituales;
- derivación o supervisión, cuando se identifiquen indicadores de riesgo.

Restricciones:

- Las sugerencias deben ser congruentes con el modelo terapéutico elegido por el Profesional.
- Las sugerencias deben vincularse con la conceptualización del caso.
- La IA debe evitar recomendaciones fuera del alcance profesional del usuario.
- La IA debe señalar cuando una situación requiere supervisión, derivación, evaluación psiquiátrica o atención urgente.
- Las sugerencias no son instrucciones obligatorias.

---

### F-10 Generar resumen terapéutico compartido para el Paciente

El Profesional puede solicitar a la IA un borrador de resumen terapéutico compartido para el Paciente.

Este resumen está destinado a ser visible en el Portal del Paciente, por lo que debe estar redactado en lenguaje claro, prudente, respetuoso y clínicamente responsable.

Para iniciar esta función, el Profesional selecciona la acción:

**“Generar resumen terapéutico para el Paciente con IA”**

La IA puede trabajar con un paquete clínico controlado que incluya:

- objetivos terapéuticos comunicables;
- acuerdos generales de seguimiento;
- tareas o indicaciones generales;
- pautas psicoeducativas;
- recursos personales identificados;
- recursos espirituales o comunitarios, cuando sean clínicamente pertinentes;
- avances que el Profesional considere oportuno comunicar;
- próximos pasos del proceso;
- directrices específicas del Profesional sobre qué debe comunicarse y qué debe omitirse.

Restricciones:

- No debe incluir notas internas del terapeuta.
- No debe incluir hipótesis clínicas no comunicadas al Paciente.
- No debe incluir conceptualización interna completa.
- No debe incluir diagnósticos no explicados previamente.
- No debe incluir información de terceros.
- No debe incluir resultados completos de pruebas psicológicas.
- No debe incluir interpretaciones que puedan dañar o confundir al Paciente fuera del contexto terapéutico.
- No debe usar lenguaje moralizante.
- No se publica automáticamente.
- El resultado se considera borrador.
- El Profesional debe revisar, corregir y aprobar el texto antes de publicarlo.
- El Paciente nunca ve borradores generados por IA.
- Toda generación de resumen terapéutico compartido con IA debe quedar registrada en auditoría.

---

### F-11 Analizar evaluación psicológica por imagen

El Profesional puede solicitar a la IA apoyo para analizar imágenes de hojas, inventarios, protocolos o resultados de evaluaciones psicológicas.

Para iniciar esta función, el Profesional selecciona la acción:

**“Analizar evaluación con IA”**

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
- El Profesional debe proporcionar puntos de corte, baremos o criterios de interpretación cuando sean necesarios.
- El sistema no debe almacenar pruebas completas como banco de instrumentos.
- Las imágenes se tratan como contenido clínico protegido.
- Las imágenes deben usarse preferentemente como insumo temporal de análisis.
- El resultado generado por IA es un borrador.
- El Profesional debe revisar, corregir y aprobar cualquier resultado antes de incorporarlo al expediente.
- Toda carga y análisis de imagen debe quedar registrada en auditoría.

---

### F-12 Recibir, revisar y validar sugerencias

Toda sugerencia generada por IA debe presentarse como borrador editable.

La interfaz debe diferenciar visualmente:

- contenido generado por IA;
- contenido editado por el Profesional;
- contenido aprobado y guardado;
- contenido rechazado o descartado.

El Profesional puede:

- aceptar el contenido tal como fue generado;
- editarlo antes de guardarlo;
- complementarlo;
- rechazarlo;
- descartarlo sin guardar.

Reglas:

- No existe guardado automático desde IA.
- Solo el Profesional puede guardar contenido clínico.
- Solo el Profesional puede publicar contenido visible para el Paciente.
- Una vez guardado, el contenido forma parte del expediente, proceso, plan, nota, evaluación o resumen correspondiente.
- El sistema debe registrar si el contenido guardado o publicado provino total o parcialmente de una sugerencia de IA.

---

## Restricciones de privacidad

El asistente clínico con IA opera con restricciones estrictas de acceso a datos.

### GPT puede acceder a:

Según la función solicitada por el Profesional, GPT puede acceder únicamente al paquete clínico controlado preparado para esa tarea.

Para prellenado de pasos terapéuticos, puede acceder a:

- contenido del proceso terapéutico activo;
- paso actual;
- pasos previos completados del mismo proceso;
- instrucciones del Profesional;
- tipo de modelo terapéutico;
- directrices clínicas agregadas para esa solicitud.

Para conceptualización de caso, puede acceder a:

- expediente clínico autorizado;
- notas de sesiones previas seleccionadas, resumidas o autorizadas;
- resultados de pruebas psicológicas relevantes;
- resultados de pruebas de personalidad;
- diagnósticos previos;
- historia clínica relevante;
- evolución del proceso;
- factores de riesgo;
- factores protectores;
- contexto espiritual o religioso cuando sea clínicamente pertinente;
- directrices clínicas agregadas por el Profesional.

Para planteamiento de tratamiento y planeación de sesiones, puede acceder a:

- conceptualización del caso;
- mecanismos originadores y mantenedores identificados;
- plan de tratamiento vigente, si existe;
- notas de sesiones previas;
- objetivos terapéuticos;
- evolución del Paciente;
- tareas realizadas o no realizadas;
- obstáculos detectados;
- riesgos actuales;
- directrices clínicas del Profesional;
- modelo terapéutico seleccionado.

Para generación de resumen terapéutico compartido para el Paciente, puede acceder únicamente a información que el Profesional considere comunicable o útil para construir un texto visible al Paciente.

Para análisis de evaluaciones psicológicas por imagen, GPT puede acceder a:

- imágenes cargadas explícitamente por el Profesional para esa solicitud;
- nombre de la prueba o inventario, si el Profesional lo proporciona;
- instrucciones clínicas del Profesional;
- puntos de corte o criterios proporcionados por el Profesional;
- contexto clínico mínimo necesario;
- resultados ya registrados, si aplica.

### GPT no puede acceder a:

- nombre completo del Paciente, salvo necesidad explícita y justificada;
- domicilio;
- teléfono;
- correo electrónico;
- número de seguridad social;
- identificadores oficiales;
- datos fiscales;
- información de otros pacientes;
- expediente completo de forma libre, permanente o indiscriminada;
- notas clínicas no autorizadas para la tarea solicitada;
- documentos completos si basta con un resumen clínico;
- información espiritual o religiosa no compartida libremente por el Paciente o no pertinente al caso;
- contenido interno no apto para ser compartido con el Paciente cuando la tarea sea generar resumen terapéutico compartido;
- banco interno de pruebas;
- manuales completos;
- reactivos almacenados como plantilla del sistema;
- claves de corrección protegidas almacenadas como recurso interno;
- imágenes de evaluaciones no autorizadas para la tarea;
- evaluaciones de otros Pacientes.

La separación entre datos clínicos necesarios y datos de identificación debe aplicarse en la capa de preparación del contexto enviado a GPT, antes de cualquier llamada a la API.

---

## Paquete clínico controlado

Antes de llamar a la API, el sistema debe construir un paquete clínico limitado a la tarea solicitada.

El paquete clínico controlado debe incluir únicamente los datos necesarios para cumplir la función seleccionada por el Profesional.

El paquete puede incluir:

- tipo de tarea solicitada;
- modelo terapéutico;
- campos que se desean completar;
- datos clínicos necesarios;
- notas seleccionadas o resumidas;
- resultados de pruebas relevantes;
- imágenes de evaluación cargadas para esa solicitud;
- conceptualización previa, si existe;
- plan de tratamiento vigente, si existe;
- directrices del Profesional;
- restricciones clínicas o éticas aplicables.

El paquete debe excluir datos de identificación directa que no sean necesarios para la tarea.

El sistema debe registrar qué tipo de información fue incluida en el paquete, sin exponer innecesariamente datos sensibles en logs técnicos.

---

## Flujo general de uso

1. Profesional selecciona una función de IA:
   - prellenar paso;
   - conceptualizar caso;
   - plantear tratamiento;
   - planear sesión;
   - sugerir intervención;
   - generar resumen terapéutico compartido;
   - analizar evaluación psicológica por imagen.

2. Sistema abre formulario de directrices clínicas.

3. Profesional agrega comentarios, hipótesis, observaciones o instrucciones.

4. Sistema construye paquete clínico controlado.

5. Sistema excluye datos identificables innecesarios.

6. IA genera borrador.

7. Profesional revisa, edita, aprueba, rechaza o descarta.

8. Solo el contenido aprobado por el Profesional puede guardarse o publicarse.

9. Sistema registra auditoría del proceso.

---

## Flujo específico de conceptualización

1. Profesional selecciona “Conceptualizar caso con IA”.
2. Sistema reúne expediente clínico + notas de sesiones disponibles y autorizadas + pruebas psicológicas relevantes + directrices del Profesional.
3. IA identifica mecanismos originadores, mecanismos mantenedores, factores precipitantes y factores protectores.
4. IA genera borrador de conceptualización.
5. Profesional revisa, corrige y aprueba.
6. Conceptualización aprobada puede guardarse en expediente.
7. Desde esa conceptualización puede derivarse plan de tratamiento.
8. Desde el plan pueden derivarse planeaciones de sesión.

---

## Flujo específico de resumen terapéutico compartido

1. Profesional selecciona “Generar resumen terapéutico para el Paciente con IA”.
2. Sistema abre formulario de directrices.
3. Profesional indica qué puede comunicarse al Paciente y qué debe omitirse.
4. Sistema construye paquete clínico controlado para resumen visible.
5. IA genera borrador en lenguaje claro, prudente y no moralizante.
6. Profesional revisa, corrige y aprueba.
7. Solo la versión aprobada puede publicarse en PORTAL-011.
8. El Paciente ve únicamente el resumen publicado.

---

## Flujo específico de análisis de evaluación por imagen

1. Profesional selecciona “Analizar evaluación con IA”.
2. Sistema solicita imágenes y directrices.
3. Profesional carga imágenes de hojas, inventarios, protocolos o resultados.
4. Profesional proporciona puntos de corte, baremos o criterios si son necesarios.
5. Sistema construye paquete clínico controlado.
6. IA extrae, organiza, suma, calcula o interpreta preliminarmente.
7. Profesional revisa, corrige y valida.
8. Solo el resultado validado puede guardarse en EVAL-014 y EXPEDIENTE-003.

---

## Reglas de negocio

1. El asistente solo puede ser activado por un Profesional autorizado.

2. El Paciente no interactúa directamente con el asistente de IA en el MVP.

3. El uso de IA sobre información clínica requiere consentimiento informado aplicable y aviso de privacidad compatible con el uso de herramientas tecnológicas o servicios de IA.

4. Las sugerencias de IA no tienen valor clínico hasta que el Profesional las revisa y guarda explícitamente.

5. La IA no emite diagnósticos definitivos.

6. La IA no sustituye el juicio clínico del Profesional.

7. La IA no puede crear, modificar ni eliminar notas clínicas por sí misma.

8. No existe guardado automático desde IA hacia el expediente, proceso terapéutico, plan de tratamiento, planeación de sesión, evaluación psicológica o portal del Paciente.

9. El Profesional puede aceptar, editar, rechazar o descartar sugerencias generadas por IA.

10. Cuando el Profesional selecciona “Conceptualizar caso con IA”, el sistema trabaja con expediente clínico + notas de sesiones disponibles y autorizadas + directrices clínicas del Profesional.

11. Para conceptualización asistida por IA, “expediente” significa expediente clínico + notas de sesiones disponibles y autorizadas + directrices clínicas del Profesional.

12. El sistema debe construir un paquete clínico controlado antes de llamar a la IA.

13. El paquete clínico debe excluir datos de identificación directa que no sean necesarios para la tarea.

14. Toda activación del asistente debe quedar registrada en auditoría.

15. El sistema debe registrar: usuario solicitante, función utilizada, fecha, hora, proceso o expediente relacionado, tipo de datos enviados, notas incluidas si aplica, evaluaciones incluidas si aplica, imágenes incluidas si aplica, directrices del Profesional, modelo utilizado, resultado generado y decisión final del Profesional.

16. El proveedor inicial del modelo será OpenAI mediante API o modalidad empresarial adecuada.

17. No se permite copiar y pegar información clínica en cuentas personales de chat para operación real del sistema.

18. Antes de usar datos clínicos reales, Catholizare debe revisar configuración de privacidad, retención, DPA, términos aplicables y controles de seguridad del proveedor.

19. El asistente puede apoyar en conceptualización de caso, planteamiento del tratamiento y planeación de sesiones, pero todas estas funciones generan únicamente borradores clínicos.

20. El plan de tratamiento y la planeación de sesiones generados por IA deben ser revisados, corregidos y aprobados por el Profesional antes de incorporarse al expediente o al proceso terapéutico.

21. La IA puede sugerir técnicas, fases, objetivos y estructura de sesiones, pero no prescribe un tratamiento obligatorio ni sustituye el juicio clínico del Profesional.

22. Toda planeación de tratamiento o sesión generada por IA debe estar vinculada explícitamente con la conceptualización del caso.

23. El sistema debe evitar planes genéricos. Cada objetivo, técnica o intervención sugerida debe responder a uno o más mecanismos clínicos identificados: originadores, mantenedores, precipitantes o protectores.

24. Los datos de espiritualidad, vida religiosa, creencias o vida moral del Paciente solo deben utilizarse cuando hayan sido compartidos libremente por el Paciente y sean clínicamente pertinentes.

25. La IA debe mantener lenguaje clínico, prudente, respetuoso y no moralizante.

26. La IA debe señalar incertidumbre clínica cuando la información sea insuficiente.

27. La IA debe sugerir supervisión, derivación o evaluación adicional cuando detecte indicadores de riesgo.

28. La IA puede generar un borrador de resumen terapéutico compartido para el Paciente.

29. El resumen terapéutico compartido generado por IA no se publica automáticamente.

30. El Profesional debe revisar, corregir y aprobar el resumen terapéutico antes de publicarlo en el portal del Paciente.

31. El Paciente nunca ve borradores generados por IA.

32. El resumen terapéutico compartido no debe incluir notas internas, hipótesis no comunicadas, conceptualización interna completa ni información de terceros.

33. La IA puede apoyar el análisis de evaluaciones psicológicas mediante imágenes cargadas por el Profesional.

34. Catholizare OS no almacena bancos de pruebas psicológicas, reactivos, manuales ni claves de corrección protegidas.

35. El Profesional es responsable de contar con licencia, autorización o derecho de uso del instrumento aplicado.

36. La IA no debe inventar baremos, puntos de corte ni criterios psicométricos.

37. Los resultados de evaluación generados por IA son borradores hasta que el Profesional los revise y valide.

38. Las imágenes de evaluaciones se tratan como contenido clínico protegido y deben usarse con mínimo necesario.

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `ai_session_id` | Identificador de la sesión de consulta al asistente |
| `professional_id` | Profesional que activa el asistente |
| `patient_id` | Paciente relacionado; no enviado necesariamente a la IA |
| `expediente_id` | Expediente relacionado, si aplica |
| `process_id` | Proceso terapéutico en el que se activó, si aplica |
| `step_id` | Paso del proceso en el que se activó, si aplica |
| `assessment_id` | Evaluación psicológica relacionada, si aplica |
| `ai_function_type` | `prellenado_paso`, `conceptualizacion_caso`, `plan_tratamiento`, `planeacion_sesion`, `sugerencia_intervencion`, `resumen_terapeutico_paciente`, `analisis_evaluacion_imagen` |
| `clinical_context_package` | Paquete clínico controlado preparado para la IA |
| `included_session_notes` | Referencias a notas incluidas, seleccionadas o resumidas |
| `included_assessments` | Referencias a evaluaciones o pruebas incluidas |
| `uploaded_image_ids` | Imágenes cargadas para análisis, si aplica |
| `professional_directives` | Directrices clínicas agregadas por el Profesional |
| `model_provider` | Proveedor del modelo, por ejemplo OpenAI |
| `model_name` | Modelo utilizado |
| `suggested_content` | Contenido generado por IA |
| `image_analysis_result` | Resultado preliminar generado a partir de imágenes, si aplica |
| `professional_decision` | `aceptado`, `editado`, `rechazado`, `descartado` |
| `published_to_patient_portal` | Indica si el contenido aprobado fue publicado en el portal del Paciente |
| `accepted_at` | Timestamp de aceptación, si aplica |
| `created_at` | Timestamp de creación de la sesión IA |
| `updated_at` | Timestamp de última actualización |

---

## Auditoría

Toda interacción con el asistente clínico debe generar registros de auditoría.

El log debe registrar como mínimo:

- usuario que activó la IA;
- rol del usuario;
- fecha y hora;
- expediente relacionado;
- proceso relacionado, si aplica;
- evaluación relacionada, si aplica;
- función utilizada;
- modelo utilizado;
- tipo de paquete clínico construido;
- si se incluyeron notas de sesión;
- si se incluyeron pruebas psicológicas;
- si se incluyeron imágenes de evaluación;
- directrices clínicas agregadas por el Profesional;
- resultado generado;
- decisión final del Profesional:
  - aceptado;
  - editado;
  - rechazado;
  - descartado;
- si el contenido fue publicado en el portal del Paciente;
- fecha de guardado o publicación, si aplica.

Restricciones:

- El log no debe exponer innecesariamente contenido clínico sensible.
- El log no debe guardar reactivos protegidos.
- El log debe permitir trazabilidad suficiente sin convertirse en copia paralela del expediente.
- Los logs no pueden ser editados ni eliminados desde la operación ordinaria.

---

## Dependencias

- EXPEDIENTE-003 — expediente clínico, historia clínica, notas de sesión, pruebas, conceptualización, evaluaciones y resumen terapéutico compartido.
- NOTAS-004 — notas clínicas autorizadas dentro de paquete clínico controlado.
- EVAL-014 — evaluaciones psicológicas, carga de imágenes y resultados validados.
- PROCESO-GENERAL-005 — procesos terapéuticos generales.
- PROCESO-TCC-006 — procesos terapéuticos basados en TCC.
- AGENDA-008 — citas y sesiones relacionadas.
- PORTAL-011 — visualización del resumen terapéutico compartido aprobado por el Profesional.
- ADMIN-012 — sin acceso al contenido clínico generado por IA.
- LOG-014 — auditoría y trazabilidad.
- PRIV-015 — privacidad, consentimiento, minimización y tratamiento de datos.
- ANALYTICS-017 — analítica agregada, sin exposición individual.
- API de OpenAI — proveedor inicial del modelo de lenguaje en MVP.

---

## Fuera de alcance del MVP

- Chatbot de atención directa al Paciente.
- Diagnóstico autónomo por IA.
- Sustitución del juicio clínico del Profesional.
- Generación autónoma de notas clínicas sin revisión humana.
- Guardado automático de contenido generado por IA.
- Publicación automática de contenido generado por IA en el portal del Paciente.
- Modificación automática del expediente por IA.
- Análisis de riesgo automatizado sin supervisión clínica.
- Integración con modelos de lenguaje distintos a OpenAI en el MVP.
- Uso de cuentas personales de chat para procesar información clínica real.
- Historial conversacional libre con GPT por caso.
- Entrenamiento personalizado del modelo con expedientes clínicos reales.
- Acceso de Administradores o Super Administradores al contenido clínico generado por IA.
- Interacción directa de IA con pacientes.
- Banco interno de pruebas psicológicas protegidas.
- Almacenamiento de manuales completos de pruebas.
- Almacenamiento de reactivos protegidos como plantillas del sistema.
- Calificación definitiva de pruebas sin validación profesional.
