# GPT-007 — Asistente Clínico GPT

## Propósito

Proveer al Profesional un asistente clínico de inteligencia artificial para apoyar tareas clínicas supervisadas, como prellenado de campos del proceso terapéutico, generación de borradores de conceptualización de caso, planteamiento del plan de tratamiento, planeación de sesiones, organización de información clínica y sugerencias de líneas de intervención.

El asistente opera únicamente como herramienta de apoyo. No diagnostica de forma definitiva, no decide, no sustituye el juicio clínico del Profesional y no guarda contenido clínico automáticamente.

Todo contenido generado por IA debe ser revisado, corregido y aprobado por el Profesional antes de incorporarse al expediente clínico, al proceso terapéutico, al plan de tratamiento o a la planeación de sesiones.

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

El asistente clínico con IA no solo apoya la conceptualización del caso, sino también el planteamiento del tratamiento y la planeación de sesiones, siempre como borrador clínico supervisado, revisado y aprobado por el Profesional.

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

En todos los casos, el Profesional conserva el control clínico del contenido generado.

Restricciones:

- El asistente solo puede ser activado por un Profesional autorizado.
- El Paciente no interactúa directamente con el asistente.
- La IA no guarda automáticamente contenido clínico.
- La IA no modifica expedientes, procesos, notas ni planes por sí misma.
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
- objetivos concretos de la consulta a IA.

Ejemplos de directrices:

- “El paciente presenta alta resistencia al cambio.”
- “Enfocar la conceptualización en el eje de creencias nucleares de abandono.”
- “Distinguir miedo realista de creencia de incompetencia.”
- “Explorar mecanismos mantenedores relacionados con evitación y autocrítica.”
- “Preparar un plan de tratamiento desde TCC.”
- “Integrar la dimensión espiritual solo como factor protector, no como explicación simplista del problema.”
- “Evitar lenguaje moralizante.”
- “Mantener enfoque clínico y antropológico-personalista.”

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

El Profesional puede agregar instrucciones como:

- “Centrar la sesión en reestructuración cognitiva.”
- “Trabajar resistencia al cambio.”
- “Explorar vínculo entre culpa y espiritualidad.”
- “Preparar una sesión TCC sobre pensamientos automáticos.”
- “Planear una sesión de seguimiento después de recaída.”
- “Proponer preguntas clínicas para evaluar avance.”
- “Evitar lenguaje moralizante.”
- “Mantener enfoque antropológico-personalista.”
- “Trabajar activación conductual.”
- “Diseñar un experimento conductual.”
- “Preparar una sesión para revisar tareas incumplidas sin confrontación agresiva.”

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

### F-10 Recibir, revisar y validar sugerencias

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
- Una vez guardado, el contenido forma parte del expediente, proceso, plan o nota correspondiente.
- El sistema debe registrar si el contenido guardado provino total o parcialmente de una sugerencia de IA.

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

Para análisis de evaluaciones psicológicas por imagen, GPT puede acceder a:

- imágenes cargadas explícitamente por el Profesional para esa solicitud;
- nombre de la prueba o inventario, si el Profesional lo proporciona;
- instrucciones clínicas del Profesional;
- puntos de corte o criterios proporcionados por el Profesional;
- contexto clínico mínimo necesario;
- resultados ya registrados, si aplica.

GPT no puede acceder a:

- banco interno de pruebas;
- manuales completos;
- reactivos almacenados como plantilla del sistema;
- claves de corrección protegidas almacenadas como recurso interno;
- imágenes de evaluaciones no autorizadas para la tarea;
- evaluaciones de otros Pacientes.

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
- información espiritual o religiosa no compartida libremente por el Paciente o no pertinente al caso.

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
- conceptualización previa, si existe;
- plan de tratamiento vigente, si existe;
- directrices del Profesional;
- restricciones clínicas o éticas aplicables.

El paquete debe excluir datos de identificación directa que no sean necesarios para la tarea.

El sistema debe registrar qué tipo de información fue incluida en el paquete, sin exponer innecesariamente datos sensibles en logs técnicos.

---

## Flujo general de uso

```text
1. Profesional selecciona una función de IA:
   - prellenar paso;
   - conceptualizar caso;
   - plantear tratamiento;
   - planear sesión;
   - sugerir intervención.
   - analizar evaluación psicológica por imagen;

2. Sistema abre formulario de directrices clínicas.

3. Profesional agrega comentarios, hipótesis, observaciones o instrucciones.

4. Sistema construye paquete clínico controlado.

5. Sistema excluye datos identificables innecesarios.

6. IA genera borrador.

7. Profesional revisa, edita, aprueba, rechaza o descarta.

8. Solo el contenido aprobado por el Profesional puede guardarse.

9. Sistema registra auditoría del proceso.


