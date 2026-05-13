# PROCESO-TCC-006 — Proceso Terapéutico — Modelo TCC

## Propósito

Gestionar el proceso terapéutico de un Paciente usando el modelo de Terapia Cognitivo-Conductual (TCC), mediante un flujo clínico estructurado que integra entrevista inicial, evaluación psicológica, conceptualización cognitivo-conductual, plan de tratamiento, ruta terapéutica editable por sesiones, notas clínicas, monitoreo de estado de ánimo, cortes de reevaluación, actualización de conceptualización, ajuste del tratamiento y egreso.

A diferencia del modelo General, la estructura base del modelo TCC está predefinida por Catholizare y no es libremente editable por el Profesional.

Sin embargo, el Profesional sí puede editar el contenido clínico del caso, las directrices para GPT-007, la conceptualización, el plan de tratamiento, la ruta terapéutica por sesiones, los objetivos, las tareas, las intervenciones sugeridas y los ajustes posteriores derivados de la evolución clínica.

El proceso TCC vive dentro del expediente clínico y se vincula con:

- EXPEDIENTE-003;
- NOTAS-004;
- EVAL-014;
- GPT-007;
- AGENDA-008;
- PORTAL-011, solo mediante el resumen terapéutico compartido aprobado.

---

## Principio clínico rector

El proceso TCC no es solo una lista de pasos. Es una ruta clínica estructurada y revisable.

La TCC en Catholizare OS debe ayudar al Profesional a pasar de la información clínica inicial a una formulación organizada del caso, identificando:

- mecanismos originadores;
- mecanismos mantenedores;
- mecanismos de cambio;
- objetivos terapéuticos;
- intervenciones coherentes;
- tareas clínicas;
- indicadores de progreso;
- señales de recaída;
- criterios de egreso.

La conceptualización TCC no se reduce a diagnóstico ni a resumen narrativo. Su función principal es explicar cómo se organiza la problemática actual, qué la originó o predispusó, qué la mantiene en el presente, qué recursos protegen al Paciente y qué ruta terapéutica conviene seguir.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Inicia y gestiona el proceso TCC, completa campos, revisa conceptualización, valida resultados, ajusta el plan y cierra el proceso. |
| Paciente | No accede directamente al proceso TCC en el MVP; solo ve el resumen terapéutico compartido publicado por el Profesional en PORTAL-011. |
| GPT-007 | Puede apoyar con borradores de conceptualización, plan de tratamiento, planeación de sesiones, análisis de evaluaciones y actualización del caso, bajo paquete clínico controlado. |
| Sistema | Vincula expediente, notas, evaluaciones, sesiones, agenda, estado de ánimo, cortes de reevaluación y auditoría. |

---

## Estructura base del modelo TCC

La estructura base del modelo TCC está predefinida por Catholizare.

El Profesional no puede agregar, eliminar ni reordenar las fases estructurales del modelo TCC.

Las fases base son:

| Fase | Nombre | Descripción |
|---|---|---|
| 1 | Preparación del proceso TCC | Verificación de expediente, consentimiento, formularios iniciales y condiciones mínimas antes de primera sesión. |
| 2 | Primera sesión / entrevista inicial | Recopilación clínica inicial, motivo de consulta, historia del problema, historia de vida relevante y observaciones clínicas. |
| 3 | Evaluación inicial | Registro o análisis de pruebas, inventarios, escalas, hojas o protocolos aplicados externamente desde EVAL-014. |
| 4 | Conceptualización TCC inicial | Formulación cognitivo-conductual del caso con mecanismos originadores, mantenedores y protectores. |
| 5 | Plan de tratamiento TCC | Definición de objetivos, mecanismos de cambio, intervenciones, medios de evaluación y criterios de avance. |
| 6 | Ruta terapéutica editable por sesiones | Planeación preliminar y editable de próximas sesiones, derivada de conceptualización y plan de tratamiento. |
| 7 | Sesiones TCC y notas clínicas | Registro de sesiones, notas de evolución, objetivo de sesión, técnica, tarea, avance y estado de ánimo. |
| 8 | Cortes de reevaluación | Reevaluación periódica mediante resultados, pruebas, estado de ánimo, notas y progreso terapéutico. |
| 9 | Actualización de conceptualización | Ajuste de hipótesis, mecanismos mantenedores, objetivos y plan según evolución clínica. |
| 10 | Prevención de recaídas | Identificación de señales de alerta, estrategias de mantenimiento, plan de acción y recursos protectores. |
| 11 | Alta / egreso | Evaluación final, cierre del proceso, nota de egreso, recomendaciones y plan de seguimiento. |

---

## Funcionalidades

### F-01 Preparar proceso TCC

Antes de iniciar formalmente el proceso TCC, el sistema debe verificar que exista un expediente clínico del Paciente.

El sistema puede revisar:

- datos mínimos de identificación;
- consentimiento informado;
- motivo de consulta inicial;
- historia clínica inicial, si existe;
- formularios previos, si existen;
- evaluaciones iniciales registradas, si existen;
- citas programadas;
- Profesional responsable.

Restricciones:

- No se puede iniciar un proceso TCC sin Paciente.
- No se puede iniciar un proceso TCC sin expediente clínico.
- No se deben crear notas clínicas ni procesos terapéuticos sin consentimiento informado, salvo excepción justificada conforme a EXPEDIENTE-003.
- Si hay información previa incompleta, el sistema puede mostrar alerta al Profesional.
- Si hay formularios o evaluaciones pendientes, el sistema puede sugerir recordatorio al Paciente por correo, según configuración.

---

### F-02 Iniciar proceso TCC

El Profesional selecciona el modelo TCC al iniciar un proceso terapéutico para un Paciente.

Al iniciar, el sistema crea una instancia del proceso TCC vinculada a:

- Paciente;
- expediente clínico;
- Profesional;
- organización, si aplica;
- plantilla TCC vigente;
- fecha de inicio;
- estado `activo`.

Restricciones:

- Solo puede haber un proceso terapéutico activo por Paciente a la vez.
- Si ya existe un proceso activo, debe cerrarse antes de iniciar uno nuevo, salvo migración controlada definida por política interna.
- La plantilla TCC usada al iniciar queda guardada como snapshot de versión.
- Cambios futuros a la plantilla TCC no modifican procesos TCC ya iniciados.

---

### F-03 Primera sesión / entrevista inicial TCC

El Profesional registra la primera sesión TCC con apoyo de una estructura de entrevista inicial.

La entrevista inicial puede incluir:

- motivo de consulta;
- historia del problema actual;
- inicio, curso y evolución del problema;
- síntomas emocionales;
- síntomas cognitivos;
- síntomas conductuales;
- síntomas fisiológicos;
- antecedentes personales relevantes;
- antecedentes familiares relevantes;
- antecedentes psicológicos o psiquiátricos;
- antecedentes médicos relevantes;
- historia de vida relevante;
- contexto familiar;
- contexto relacional;
- contexto laboral o académico;
- contexto espiritual o religioso, cuando haya sido compartido libremente por el Paciente y sea clínicamente pertinente;
- factores de riesgo;
- factores protectores;
- observaciones clínicas;
- estado mental;
- hipótesis iniciales del Profesional;
- directrices clínicas para GPT-007.

Restricciones:

- La entrevista inicial no sustituye la nota clínica correspondiente.
- La nota clínica se gestiona desde NOTAS-004.
- El contenido registrado forma parte del expediente clínico.
- GPT-007 puede apoyar en organizar la información únicamente bajo activación explícita del Profesional.
- La información espiritual o religiosa no debe forzarse ni usarse como explicación reduccionista del problema.

---

### F-04 Registrar evaluación inicial

El Profesional puede vincular evaluaciones psicológicas iniciales al proceso TCC.

Las evaluaciones se gestionan desde EVAL-014.

El proceso TCC puede consultar o utilizar:

- nombre de la evaluación;
- fecha de aplicación;
- finalidad clínica;
- imágenes cargadas para análisis, si aplica;
- puntajes;
- resultados validados;
- interpretación clínica;
- limitaciones;
- implicaciones terapéuticas.

Las evaluaciones pueden incluir:

- inventarios;
- escalas clínicas;
- cuestionarios;
- pruebas de personalidad;
- resultados externos;
- hojas o protocolos aplicados externamente;
- imágenes cargadas por el Profesional para análisis con IA.

Restricciones:

- El proceso TCC no almacena pruebas completas.
- El proceso TCC no almacena reactivos protegidos.
- El proceso TCC no almacena manuales completos.
- El proceso TCC no almacena claves de corrección protegidas.
- El proceso TCC solo consulta resultados registrados o validados desde EVAL-014.
- GPT-007 puede analizar imágenes o resultados únicamente dentro de un paquete clínico controlado.
- El Profesional es responsable de contar con derecho, licencia o autorización para usar el instrumento aplicado.

---

### F-05 Conceptualizar caso con enfoque TCC

El Profesional puede generar, redactar o solicitar apoyo de GPT-007 para elaborar una conceptualización cognitivo-conductual inicial.

Para iniciar apoyo de IA, el Profesional selecciona:

**"Conceptualizar caso TCC con IA"**

La conceptualización TCC debe integrar:

- expediente clínico;
- entrevista inicial;
- notas de sesiones disponibles, si existen;
- resultados de evaluaciones psicológicas;
- imágenes o análisis de evaluación autorizados, si aplica;
- directrices clínicas agregadas por el Profesional;
- observaciones de entrevista;
- hipótesis clínicas iniciales.

La conceptualización debe organizarse alrededor de:

- historia sintética del caso;
- motivo de consulta;
- descripción del problema actual;
- antecedentes relevantes;
- síntomas emocionales, cognitivos, conductuales y fisiológicos;
- factores precipitantes;
- mecanismos originadores;
- mecanismos mantenedores;
- mecanismos de cambio;
- factores protectores;
- análisis funcional;
- formulación transversal;
- formulación longitudinal;
- pensamientos automáticos;
- distorsiones cognitivas;
- creencias intermedias;
- creencias nucleares;
- patrones de evitación;
- conductas de seguridad;
- reforzadores;
- intentos de solución que mantienen el problema;
- hipótesis de trabajo;
- lista de problemas;
- objetivos terapéuticos;
- plan de tratamiento preliminar;
- obstáculos previsibles;
- criterios de seguimiento.

Restricciones:

- La conceptualización generada por IA es borrador.
- El Profesional debe revisar, corregir y aprobar antes de guardar.
- La IA no emite diagnóstico definitivo.
- La IA no sustituye el juicio clínico del Profesional.
- La IA debe diferenciar hechos reportados, inferencias clínicas e hipótesis.
- La IA debe señalar incertidumbre cuando falte información.
- Toda conceptualización asistida por IA debe quedar registrada en auditoría.

---

### F-06 Identificar mecanismos originadores

El sistema debe permitir registrar mecanismos originadores de la problemática.

Los mecanismos originadores ayudan a explicar cómo se formó la vulnerabilidad clínica del Paciente.

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

Restricciones:

- Los mecanismos originadores se formulan como hipótesis clínicas, no como afirmaciones absolutas.
- Deben basarse en información del expediente, entrevista, notas o evaluaciones.
- La dimensión espiritual solo debe integrarse cuando sea clínicamente pertinente y haya sido compartida libremente por el Paciente.

---

### F-07 Identificar mecanismos mantenedores

El sistema debe permitir registrar mecanismos mantenedores actuales.

Los mecanismos mantenedores explican por qué el problema sigue activo en el presente.

Pueden incluir:

- pensamientos automáticos;
- distorsiones cognitivas;
- creencias nucleares activadas;
- rumiación;
- evitación;
- conductas de seguridad;
- autocrítica;
- baja activación conductual;
- inhibición emocional;
- falta de límites;
- postergación de necesidades;
- reforzamiento negativo;
- conflictos relacionales;
- ambientes invalidantes;
- síntomas fisiológicos;
- intentos de solución que mantienen el problema;
- dinámicas espirituales mal integradas, como culpa rígida, falsa resignación, escrupulosidad o evitación espiritual.

Restricciones:

- Los mecanismos mantenedores deben vincularse con conductas, cogniciones, emociones o contextos actuales.
- Deben orientar el plan de tratamiento.
- No deben formularse como juicio moral del Paciente.

---

### F-08 Identificar mecanismos de cambio

El sistema debe permitir registrar mecanismos de cambio esperados.

Los mecanismos de cambio son los procesos clínicos que el tratamiento buscará activar para modificar la problemática.

Pueden incluir:

- activación conductual;
- aumento de conductas reforzantes;
- exposición gradual, cuando aplique;
- reducción de evitación;
- reestructuración cognitiva;
- modificación de creencias;
- experimentos conductuales;
- entrenamiento en habilidades;
- regulación emocional;
- solución de problemas;
- clarificación de valores;
- fortalecimiento de límites;
- prevención de recaídas;
- fortalecimiento de factores protectores;
- integración funcional de recursos espirituales, cuando aplique.

Restricciones:

- Cada mecanismo de cambio debe vincularse con uno o más mecanismos mantenedores.
- El sistema debe evitar planes de tratamiento genéricos.
- La IA puede sugerir mecanismos de cambio, pero el Profesional decide y valida.

---

### F-09 Plantear plan de tratamiento TCC

El Profesional puede generar o solicitar apoyo de GPT-007 para elaborar un plan de tratamiento TCC.

El plan debe derivarse de la conceptualización.

Debe incluir:

- problema principal;
- lista de problemas;
- objetivo general;
- objetivos específicos;
- objetivos instrumentales;
- medios de evaluación;
- mecanismos mantenedores a trabajar;
- mecanismos de cambio esperados;
- intervenciones sugeridas;
- tareas terapéuticas;
- criterios de avance;
- indicadores de riesgo;
- indicadores de derivación o supervisión;
- obstáculos previsibles;
- monitoreo de progreso.

Restricciones:

- El plan no debe ser genérico.
- Cada intervención debe vincularse con la conceptualización.
- La IA no prescribe tratamiento obligatorio.
- El Profesional puede aceptar, editar, rechazar o descartar sugerencias.
- El plan aprobado queda vinculado al expediente y al proceso TCC.

---

### F-10 Crear ruta terapéutica editable por sesiones

El Profesional puede crear una ruta terapéutica preliminar por sesiones.

La ruta terapéutica es editable y no constituye un plan rígido.

Puede incluir:

- número de sesión;
- objetivo de sesión;
- mecanismo clínico a trabajar;
- intervención principal;
- intervención secundaria;
- tarea terapéutica sugerida;
- evaluación o escala a revisar;
- material de apoyo;
- criterio de avance;
- observaciones del Profesional;
- estado de la sesión: `planeada`, `realizada`, `ajustada`, `cancelada`.

La ruta puede ser generada manualmente o como borrador con apoyo de GPT-007.

Restricciones:

- La ruta de sesiones es una guía editable.
- No obliga al Profesional a seguir una secuencia rígida.
- Las sesiones reales se gestionan desde AGENDA-008.
- La creación de una ruta no crea automáticamente citas en la agenda.
- El Profesional debe confirmar manualmente cualquier cita que se cree desde la ruta.

---

### F-11 Planear próxima sesión con IA

El Profesional puede solicitar apoyo de GPT-007 para planear una sesión individual.

La planeación debe tomar en cuenta:

- conceptualización actual;
- plan de tratamiento aprobado;
- ruta terapéutica;
- notas previas;
- estado de ánimo registrado;
- tareas realizadas o no realizadas;
- evolución reciente;
- resultados de evaluación;
- directrices clínicas del Profesional.

La IA puede sugerir:

- objetivo de sesión;
- estructura;
- preguntas clínicas;
- técnica principal;
- técnica secundaria;
- tarea para casa;
- obstáculos posibles;
- criterio de avance;
- elementos a revisar en la próxima sesión.

Restricciones:

- La IA no conduce la sesión.
- La IA no interactúa con el Paciente.
- La planeación es borrador.
- El Profesional debe revisar y aprobar antes de usarla o guardarla.

---

### F-12 Registrar sesión TCC y nota clínica vinculada

Cada sesión TCC puede vincularse a:

- cita en AGENDA-008;
- nota clínica en NOTAS-004;
- paso o fase del proceso TCC;
- objetivo terapéutico;
- intervención utilizada;
- tarea asignada;
- estado de ánimo;
- ruta terapéutica.

La nota clínica se crea y confirma desde NOTAS-004.

El proceso TCC puede sugerir una estructura para la nota, incluyendo:

- número de sesión;
- objetivo de sesión;
- resumen de la conceptualización relevante;
- mecanismo trabajado;
- técnica usada;
- respuesta del Paciente;
- tarea asignada;
- estado de ánimo;
- plan para la siguiente sesión.

Restricciones:

- PROCESO-TCC-006 no sustituye NOTAS-004.
- La nota clínica formal vive en NOTAS-004.
- El Profesional debe confirmar la nota según reglas de NOTAS-004.
- El Paciente no ve la nota clínica completa en el portal.

---

### F-13 Registrar estado de ánimo por sesión

El Profesional puede registrar un seguimiento breve del estado de ánimo del Paciente por sesión.

Campos sugeridos:

- fecha;
- sesión asociada;
- puntuación de estado de ánimo, escala 1 a 10;
- ansiedad subjetiva, escala 1 a 10, opcional;
- esperanza subjetiva, escala 1 a 10, opcional;
- sensación de eficacia, escala 1 a 10, opcional;
- comentario breve;
- fuente: reportado por Paciente, observado por Profesional o mixto.

El sistema puede mostrar una gráfica simple de evolución.

Restricciones:

- El registro de estado de ánimo no sustituye evaluación psicológica formal.
- El registro sirve para monitoreo clínico.
- La gráfica es visible solo para el Profesional en MVP.
- El Paciente no ve esta gráfica en MVP, salvo que se defina en un módulo posterior.
- La interpretación final corresponde al Profesional.

---

### F-14 Realizar corte de reevaluación

El Profesional puede realizar cortes de reevaluación durante el proceso TCC.

Los cortes pueden ocurrir:

- después de un número determinado de sesiones;
- cuando el Profesional lo decida;
- ante cambio clínico relevante;
- antes de ajustar el plan;
- antes del egreso.

Un corte de reevaluación puede incluir:

- revisión de notas previas;
- revisión de estado de ánimo;
- revisión de tareas terapéuticas;
- comparación de evaluaciones psicológicas;
- nuevas imágenes o resultados desde EVAL-014;
- nueva interpretación clínica;
- análisis de avances;
- obstáculos;
- actualización de riesgos;
- actualización de hipótesis;
- decisión de continuar, ajustar o cerrar.

Restricciones:

- Las evaluaciones se gestionan desde EVAL-014.
- Los resultados generados por IA son borradores.
- El Profesional debe validar cualquier resultado antes de usarlo clínicamente.
- El corte de reevaluación no modifica automáticamente el plan.
- Toda modificación debe ser aprobada por el Profesional.

---

### F-15 Actualizar conceptualización TCC

Después de un corte de reevaluación o de cambios clínicos relevantes, el Profesional puede actualizar la conceptualización TCC.

La actualización puede incluir:

- cambios en hipótesis de trabajo;
- mecanismos mantenedores nuevos;
- mecanismos mantenedores reducidos;
- cambios en creencias relevantes;
- evolución de síntomas;
- resultados de nuevas evaluaciones;
- respuesta al tratamiento;
- obstáculos encontrados;
- factores protectores nuevos;
- ajuste de objetivos;
- ajuste del plan de tratamiento.

GPT-007 puede apoyar generando un borrador de actualización.

Restricciones:

- La conceptualización anterior no se elimina.
- El sistema debe conservar versiones.
- La nueva conceptualización debe indicar fecha, Profesional y motivo de actualización.
- La IA genera borrador; el Profesional valida.
- La conceptualización actualizada puede usarse para replantear sesiones siguientes.

---

### F-16 Ajustar plan y próximas sesiones

El Profesional puede ajustar el plan de tratamiento y la ruta terapéutica por sesiones.

El ajuste puede derivarse de:

- evolución clínica;
- notas de sesión;
- estado de ánimo;
- tareas cumplidas o no cumplidas;
- nuevas evaluaciones;
- conceptualización actualizada;
- cambio de objetivos;
- riesgo clínico;
- supervisión o mentoría externa.

El sistema puede permitir:

- editar objetivos;
- agregar nuevas intervenciones;
- pausar intervenciones;
- reordenar sesiones planeadas;
- crear nuevas sesiones sugeridas;
- marcar sesiones como ajustadas;
- conservar historial de cambios.

Restricciones:

- Ajustar la ruta no modifica citas de agenda automáticamente.
- Las citas deben cambiarse desde AGENDA-008 o por confirmación explícita del Profesional.
- El sistema debe registrar historial de ajustes.

---

### F-17 Psicoeducación TCC

El Profesional puede registrar psicoeducación entregada al Paciente.

Temas posibles:

- modelo cognitivo-conductual;
- relación pensamiento-emoción-conducta;
- activación conductual;
- pensamientos automáticos;
- distorsiones cognitivas;
- exposición;
- experimentos conductuales;
- regulación emocional;
- prevención de recaídas;
- papel de tareas terapéuticas;
- integración prudente de recursos espirituales, si aplica.

Restricciones:

- El contenido psicoeducativo no se publica automáticamente en el portal.
- Puede incluirse en resumen terapéutico compartido solo si el Profesional lo aprueba.
- No debe moralizar ni culpabilizar al Paciente.

---

### F-18 Intervención conductual

El Profesional puede registrar intervenciones conductuales.

Campos sugeridos:

- conducta objetivo;
- conducta evitativa;
- hipótesis funcional;
- intervención seleccionada;
- tarea asignada;
- nivel de dificultad;
- resultado esperado;
- resultado observado;
- obstáculos;
- ajustes.

Intervenciones posibles:

- activación conductual;
- programación de actividades;
- exposición gradual;
- experimentos conductuales;
- solución de problemas;
- entrenamiento en habilidades;
- registro de actividades;
- práctica de límites;
- acciones dirigidas a valores.

---

### F-19 Reestructuración cognitiva

El Profesional puede registrar trabajo de reestructuración cognitiva.

Campos sugeridos:

- situación activadora;
- pensamiento automático;
- significado del pensamiento;
- emoción;
- intensidad emocional;
- conducta;
- distorsión cognitiva;
- evidencia a favor;
- evidencia en contra;
- pensamiento alternativo;
- nueva emoción;
- tarea de seguimiento;
- creencia intermedia relacionada;
- creencia nuclear relacionada.

Restricciones:

- No debe forzarse pensamiento alternativo falso o superficial.
- El Profesional debe cuidar que el trabajo cognitivo respete la realidad del Paciente.
- La dimensión espiritual, si aparece, debe integrarse como recurso, no como evasión o moralización.

---

### F-20 Entrenamiento en habilidades

El Profesional puede registrar entrenamiento en habilidades.

Áreas posibles:

- regulación emocional;
- afrontamiento;
- comunicación asertiva;
- resolución de problemas;
- límites;
- toma de decisiones;
- autocuidado;
- tolerancia al malestar;
- organización conductual;
- prevención de recaídas.

---

### F-21 Prevención de recaídas

El Profesional puede construir un plan de prevención de recaídas.

El plan puede incluir:

- señales tempranas de recaída;
- pensamientos de riesgo;
- emociones de riesgo;
- conductas de riesgo;
- situaciones vulnerables;
- estrategias de afrontamiento;
- plan de acción;
- red de apoyo;
- recursos espirituales o comunitarios, si aplican;
- criterios para volver a terapia;
- recomendaciones de seguimiento.

---

### F-22 Alta / egreso del proceso TCC

El Profesional puede cerrar el proceso TCC cuando existan criterios clínicos suficientes.

El cierre puede incluir:

- evaluación final;
- comparación con línea base;
- revisión de objetivos;
- logros;
- dificultades pendientes;
- conceptualización final o resumen de evolución;
- plan de prevención de recaídas;
- recomendaciones;
- nota de egreso en NOTAS-004;
- estado final del proceso.

Restricciones:

- El cierre no elimina el expediente.
- El cierre debe vincularse a nota de egreso.
- El proceso cerrado es de solo lectura.
- Si el Paciente retorna, se crea un nuevo proceso terapéutico o se define reapertura según política interna.
- El egreso debe quedar registrado en auditoría.

---

## Estados del proceso TCC

| Estado | Descripción |
|---|---|
| `preparacion` | Proceso preparado, pendiente de primera sesión o información mínima. |
| `activo` | Proceso TCC en curso. |
| `en_reevaluacion` | Proceso en corte de reevaluación o actualización de conceptualización. |
| `ajustado` | Proceso con plan o ruta modificada después de reevaluación. |
| `cerrado` | Proceso finalizado y vinculado a nota de egreso. |
| `archivado` | Proceso cerrado y conservado históricamente. |

---

## Campos predefinidos de referencia

### Preparación

- expediente vinculado;
- consentimiento informado;
- formulario inicial;
- evaluaciones iniciales pendientes;
- fecha de primera sesión;
- estado de preparación.

### Entrevista inicial

- motivo de consulta;
- historia del problema;
- síntomas emocionales;
- síntomas cognitivos;
- síntomas conductuales;
- síntomas fisiológicos;
- antecedentes personales;
- antecedentes familiares;
- antecedentes psicológicos o psiquiátricos;
- antecedentes médicos;
- historia de vida relevante;
- estado mental;
- factores de riesgo;
- factores protectores;
- observaciones clínicas;
- directrices del Profesional.

### Evaluación inicial

- evaluación aplicada;
- fecha;
- resultados;
- interpretación validada;
- limitaciones;
- implicaciones terapéuticas;
- vínculo a EVAL-014.

### Conceptualización TCC

- precipitantes;
- formulación transversal;
- formulación longitudinal;
- mecanismos originadores;
- mecanismos mantenedores;
- mecanismos de cambio;
- pensamientos automáticos;
- creencias intermedias;
- creencias nucleares;
- conductas de evitación;
- reforzadores;
- factores protectores;
- hipótesis de trabajo;
- lista de problemas.

### Plan de tratamiento

- objetivo general;
- objetivos específicos;
- objetivos instrumentales;
- medios de evaluación;
- intervenciones;
- técnicas;
- tareas;
- criterios de avance;
- obstáculos;
- monitoreo.

### Ruta terapéutica

- número de sesión;
- objetivo;
- mecanismo a trabajar;
- intervención;
- tarea;
- evaluación;
- estado;
- ajustes.

### Sesión TCC

- cita vinculada;
- nota vinculada;
- número de sesión;
- objetivo de sesión;
- técnica trabajada;
- tarea revisada;
- nueva tarea;
- estado de ánimo;
- avance;
- obstáculos;
- plan siguiente.

### Corte de reevaluación

- fecha;
- sesiones revisadas;
- evaluaciones comparadas;
- estado de ánimo;
- cambios clínicos;
- hipótesis actualizada;
- ajustes requeridos.

### Egreso

- motivo de egreso;
- objetivos logrados;
- objetivos pendientes;
- evolución;
- prevención de recaídas;
- recomendaciones;
- nota de egreso vinculada.

---

## Reglas de negocio

1. La estructura base del modelo TCC no es editable por el Profesional.

2. Solo el equipo de Catholizare puede modificar la plantilla base TCC.

3. Cambios futuros en la plantilla TCC no afectan procesos TCC en curso.

4. Solo puede haber un proceso terapéutico activo por Paciente a la vez, independientemente del modelo.

5. El proceso TCC vive dentro del expediente clínico.

6. El proceso TCC puede vincularse a notas clínicas, citas, evaluaciones, conceptualizaciones, planes y rutas de sesión.

7. Las notas clínicas formales se gestionan desde NOTAS-004.

8. Las evaluaciones psicológicas se gestionan desde EVAL-014.

9. Las citas y videollamadas se gestionan desde AGENDA-008 y ZOOM-010.

10. GPT-007 no tiene acceso libre, permanente ni indiscriminado al expediente completo.

11. GPT-007 solo trabaja con paquete clínico controlado y autorizado por el Profesional.

12. Las sugerencias de GPT-007 son borradores; no se guardan hasta que el Profesional las revisa, edita y aprueba.

13. La conceptualización TCC puede generarse con apoyo de IA, pero solo tiene valor clínico cuando el Profesional la aprueba.

14. El plan de tratamiento puede generarse con apoyo de IA, pero debe ser revisado y aprobado por el Profesional.

15. La ruta terapéutica por sesiones es editable y no debe tratarse como plan rígido.

16. Las reevaluaciones no modifican automáticamente la conceptualización ni el plan; el Profesional debe aprobar los cambios.

17. El sistema debe conservar versiones de conceptualizaciones y planes aprobados.

18. El estado de ánimo por sesión es un dato clínico de monitoreo, no una evaluación diagnóstica.

19. El Paciente no accede directamente al proceso TCC en MVP.

20. El Paciente solo puede ver un resumen terapéutico compartido si el Profesional lo publica desde EXPEDIENTE-003 / PORTAL-011.

21. El proceso TCC no almacena pruebas psicológicas completas ni instrumentos protegidos.

22. El proceso TCC no almacena reactivos, manuales ni claves protegidas.

23. El proceso TCC puede consultar resultados validados desde EVAL-014.

24. La información espiritual o religiosa solo debe registrarse si fue compartida libremente por el Paciente y es clínicamente pertinente.

25. La integración espiritual debe funcionar como recurso clínico prudente, no como moralización ni explicación simplista del sufrimiento.

26. El cierre del proceso TCC requiere nota de egreso vinculada.

27. Un proceso cerrado es de solo lectura.

28. Toda creación, modificación, consulta, cierre, reevaluación o actualización debe quedar registrada en auditoría.

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `process_id` | Identificador único del proceso TCC |
| `expediente_id` | Expediente al que pertenece |
| `patient_id` | Paciente relacionado |
| `professional_id` | Profesional responsable |
| `model_type` | `tcc` |
| `template_version` | Versión de la plantilla TCC usada al iniciar |
| `template_snapshot` | Copia de la plantilla TCC al momento de inicio |
| `status` | `preparacion`, `activo`, `en_reevaluacion`, `ajustado`, `cerrado`, `archivado` |
| `started_at` | Fecha de inicio |
| `closed_at` | Fecha de cierre |
| `preparation_data` | Datos de preparación del proceso |
| `initial_interview_data` | Datos de entrevista inicial |
| `initial_assessment_ids` | Evaluaciones iniciales vinculadas desde EVAL-014 |
| `conceptualization_id` | Conceptualización TCC vigente |
| `conceptualization_versions` | Versiones previas de conceptualización |
| `treatment_plan_id` | Plan de tratamiento vigente |
| `treatment_plan_versions` | Versiones previas del plan |
| `session_plan_items` | Ruta terapéutica editable por sesiones |
| `linked_appointment_ids` | Citas vinculadas |
| `linked_note_ids` | Notas clínicas vinculadas |
| `linked_assessment_ids` | Evaluaciones vinculadas |
| `mood_tracking_entries` | Registros de estado de ánimo |
| `reevaluation_cuts` | Cortes de reevaluación realizados |
| `gpt_instructions` | Directrices del Profesional para GPT-007 |
| `ai_session_ids` | Sesiones de IA relacionadas |
| `created_at` | Fecha de creación |
| `updated_at` | Fecha de última modificación |

---

## Auditoría

El sistema debe registrar eventos relevantes del proceso TCC.

Eventos mínimos:

- inicio de proceso TCC;
- preparación completada;
- registro de entrevista inicial;
- vinculación de evaluación;
- solicitud de conceptualización con IA;
- aprobación de conceptualización;
- creación de plan de tratamiento;
- ajuste de plan;
- creación o modificación de ruta terapéutica;
- vinculación de cita;
- vinculación de nota;
- registro de estado de ánimo;
- corte de reevaluación;
- actualización de conceptualización;
- cierre del proceso;
- consulta del proceso;
- intento de acceso no autorizado.

Cada evento debe registrar:

- usuario;
- rol;
- fecha y hora;
- acción;
- proceso afectado;
- expediente relacionado;
- Paciente relacionado;
- resultado de la acción;
- identificador de sesión o IP, si está disponible.

Restricciones:

- El log no debe convertirse en copia paralela del expediente.
- El log no debe exponer innecesariamente contenido clínico sensible.
- Los logs no pueden editarse ni eliminarse desde operación ordinaria.

---

## Dependencias

- EXPEDIENTE-003 — el proceso TCC vive dentro del expediente clínico.
- NOTAS-004 — las notas de sesión y nota de egreso se gestionan desde NOTAS-004.
- EVAL-014 — evaluaciones psicológicas, imágenes autorizadas, resultados validados y comparaciones.
- GPT-007 — conceptualización, plan de tratamiento, planeación de sesiones, análisis de evaluaciones y actualización del caso.
- AGENDA-008 — citas y sesiones vinculadas al proceso TCC.
- ZOOM-010 — videollamadas asociadas a citas, si aplica.
- PORTAL-011 — solo muestra resumen terapéutico compartido aprobado, no el proceso TCC completo.
- LOG-014 — auditoría y trazabilidad.
- PRIV-015 — privacidad, consentimiento, minimización y tratamiento de datos.
- PRO-013 — puede mostrar recursos o banners de mentoría/revisión de casos al Profesional, sin acceder al contenido clínico.

---

## Fuera de alcance del MVP

- Modificación libre de la estructura base del modelo TCC por el Profesional.
- Protocolos TCC especializados por trastorno, como TCC para TOC, fobia, trauma o adicciones.
- Banco interno de instrumentos psicológicos.
- Aplicación directa de pruebas psicológicas protegidas dentro del proceso TCC.
- Distribución de pruebas al Paciente desde el proceso TCC.
- Automatización completa de recordatorios clínicos personalizados.
- Creación automática de citas desde la ruta terapéutica sin confirmación del Profesional.
- Cierre automático del proceso por IA.
- Diagnóstico automático por IA.
- Reemplazo del juicio clínico del Profesional.
- Acceso del Paciente al proceso TCC completo.
- Visualización de gráfica de estado de ánimo por el Paciente.
- Exportación completa del proceso TCC a PDF.
- Estadísticas clínicas agregadas desde procesos TCC sin módulo de anonimización.
- Supervisión clínica interna automática.
- Integración con protocolos editoriales licenciados de TCC.
