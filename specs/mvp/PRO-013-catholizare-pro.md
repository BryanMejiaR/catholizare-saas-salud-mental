# PRO-013 — Catholizare Pro

## Propósito

Proveer al Profesional una sección llamada **Recursos** dentro de su panel, conectada con los contenidos publicados en `profesionales.catholizare.com`, y mostrar banners contextuales de Catholizare Pro a lo largo del sistema para promover recursos clínicos, formación, revisión de casos, mentoría, reuniones clínicas y vida comunitaria profesional.

El módulo también permite administrar recursos, banners, anuncios, fechas de reuniones y recordatorios por correo desde el panel administrativo.

Catholizare Pro debe acompañar al Profesional dentro de su flujo de trabajo, recordándole recursos, formación, revisión de casos y vida comunitaria, sin interrumpir la atención clínica ni exponer información del Paciente.

El contenido de Catholizare Pro es visible únicamente para Profesionales. No es visible para Pacientes.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Ve recursos, banners, anuncios, fechas de reuniones, recordatorios y enlaces de Catholizare Pro dentro de su panel. |
| Administrador | Gestiona recursos, banners, anuncios, eventos, fechas de reuniones y recordatorios de Catholizare Pro. |
| Super Administrador | Tiene control global del módulo, supervisa la configuración y puede gestionar todo el contenido Pro. |
| Paciente | Sin acceso; el contenido Pro no es visible en el portal del Paciente. |
| Sistema | Muestra banners contextuales, recursos, eventos y recordatorios según reglas de visibilidad. |

---

## Principio rector

Catholizare Pro debe ser un módulo de acompañamiento profesional, formación continua, revisión de casos y comunidad.

No debe interrumpir flujos clínicos críticos.

No debe exponer información clínica de Pacientes.

No debe confundirse con el expediente, las notas clínicas ni el proceso terapéutico.

---

## Funcionalidades

### F-01 Sección Recursos del Profesional

El Profesional accede a una sección llamada **Recursos** dentro de su panel.

Esta sección muestra recursos publicados en `profesionales.catholizare.com` o registrados manualmente por el Administrador dentro de Catholizare OS.

Los recursos pueden incluir:

- fichas clínicas;
- guías terapéuticas;
- herramientas descargables;
- respuestas profesionales;
- artículos de apoyo;
- recursos psicológicos;
- fichas de orientación psicológica;
- recursos de integración psicología y fe;
- materiales formativos para la práctica profesional;
- enlaces a mentoría;
- enlaces a reuniones clínicas;
- enlaces a revisión de casos;
- enlaces a Contagio de Fe;
- enlaces a preguntas para profesionales.

En el MVP, los recursos pueden abrirse mediante URL externa hacia `profesionales.catholizare.com` o `catholizare.com`.

Restricciones:

- Los recursos son visibles solo para usuarios con rol Profesional.
- El Paciente no ve recursos de Catholizare Pro.
- Los recursos no deben incluir información clínica identificable de Pacientes.
- Los recursos desactivados no se muestran.
- Los recursos pueden ser administrados por Administrador y Super Administrador.

---

### F-02 Mostrar banners de Catholizare Pro en el sistema

El sistema puede mostrar banners de Catholizare Pro en secciones estratégicas del panel del Profesional.

Secciones permitidas:

- dashboard;
- expediente;
- notas clínicas;
- agenda;
- proceso terapéutico;
- conceptualización;
- plan de tratamiento;
- sección de recursos;
- sección de citas;
- sección de pacientes;
- sección de configuración profesional, si aplica.

Los banners pueden promover:

- recursos clínicos;
- nuevas fichas o guías;
- revisión de casos;
- mentoría personalizada;
- reuniones clínicas;
- Contagio de Fe;
- formación continua;
- preguntas a profesionales;
- herramientas terapéuticas;
- buenas prácticas clínicas;
- invitación a postular un caso;
- recordatorio de revisar casos con un mentor.

Ejemplos de banners:

- “¿Este caso te genera dudas clínicas? Recuerda que puedes revisarlo con un mentor de Catholizare Pro.”
- “Próxima Revisión de Casos: consulta la fecha y postula tu caso.”
- “Contagio de Fe: fortalece tu vida interior y tu misión como profesional católico.”
- “Nueva ficha clínica disponible en Recursos.”
- “Revisar tus casos es una buena práctica profesional. Agenda una mentoría.”

Restricciones:

- Los banners no deben bloquear tareas clínicas.
- No deben aparecer como modales obligatorios durante notas, sesiones o procesos críticos.
- No deben ocultar campos clínicos importantes.
- No deben condicionar el uso del sistema.
- El Profesional puede cerrar o ignorar un banner.
- El sistema puede recordar qué banners ya fueron vistos o descartados.
- Los banners expirados no se muestran.
- Los banners no son visibles para Pacientes.

---

### F-03 Banners contextuales por sección

El Administrador puede definir en qué secciones aparece cada banner.

Ejemplos de contexto:

| Sección | Tipo de banner recomendado |
|---|---|
| Dashboard | Próximas reuniones, Contagio de Fe, Revisión de Casos, nuevos recursos. |
| Expediente | Recordatorio de mentoría o revisión de caso complejo. |
| Notas clínicas | Recordatorio prudente de revisar casos difíciles o postular caso. |
| Agenda | Próximas reuniones, reuniones clínicas, Contagio de Fe. |
| Conceptualización | Invitación a supervisión, mentoría o revisión de caso. |
| Plan de tratamiento | Recursos clínicos o fichas terapéuticas relacionadas. |
| Recursos | Recursos destacados, nuevos materiales, reuniones próximas. |

Reglas:

- Los banners deben ser útiles para el flujo en el que aparecen.
- Los banners deben ser discretos.
- Los banners deben evitar saturación visual.
- El sistema debe permitir limitar frecuencia de aparición.

---

### F-04 Ver recursos terapéuticos de Pro

El Profesional puede consultar recursos terapéuticos desde la sección Recursos.

Cada recurso puede mostrar:

- título;
- descripción breve;
- categoría;
- tipo de recurso;
- imagen o ícono;
- enlace de acceso;
- fecha de publicación;
- estado;
- etiquetas;
- fuente.

Tipos de recurso permitidos:

- enlace externo;
- archivo;
- artículo;
- ficha;
- guía;
- video;
- recurso descargable;
- página de profesionales;
- página de mentoría;
- formulario externo;
- evento relacionado.

Categorías sugeridas:

- Revisión de casos;
- Mentoría;
- Reuniones clínicas;
- Contagio de Fe;
- Fichas clínicas;
- Psicología y fe;
- Recursos psicológicos;
- Formación profesional;
- Herramientas terapéuticas;
- Preguntas profesionales;
- Comunidad.

Restricciones:

- En MVP, el recurso puede abrir en una nueva pestaña.
- En MVP, la sincronización automática con WordPress queda fuera de alcance, salvo que se defina un endpoint simple.
- El recurso no debe contener datos clínicos de Pacientes.
- El recurso puede apuntar a `profesionales.catholizare.com` o `catholizare.com`.

---

### F-05 Gestionar recursos Pro

El Administrador y el Super Administrador pueden crear, editar, activar, desactivar y ordenar recursos Pro desde el panel administrativo.

Campos mínimos de un recurso:

- título;
- descripción;
- tipo;
- categoría;
- URL o archivo;
- imagen opcional;
- etiquetas;
- estado;
- secciones donde puede aparecer;
- fecha de inicio de visibilidad;
- fecha de fin de visibilidad, opcional;
- usuario creador.

Acciones permitidas:

- crear recurso;
- editar recurso;
- activar recurso;
- desactivar recurso;
- ordenar recurso;
- destacar recurso;
- asignar recurso a una sección;
- quitar recurso destacado.

Restricciones:

- El Administrador puede gestionar contenido Pro, pero no accede a datos clínicos.
- El Super Administrador puede supervisar y modificar todos los recursos.
- Los recursos inactivos no se muestran al Profesional.
- Los recursos expirados no se muestran salvo que se reactive su visibilidad.

---

### F-06 Gestionar banners y anuncios

El Administrador y el Super Administrador pueden gestionar banners y anuncios visibles en el panel del Profesional.

Un banner puede incluir:

- título;
- cuerpo;
- imagen opcional;
- botón de llamada a la acción;
- URL de destino;
- secciones donde se muestra;
- fecha de inicio;
- fecha de fin;
- prioridad;
- frecuencia de aparición;
- estado.

Tipos de banner:

- recurso destacado;
- evento próximo;
- mentoría personalizada;
- revisión de casos;
- Contagio de Fe;
- reunión clínica;
- formación;
- anuncio institucional;
- actualización de plataforma;
- recomendación de buena práctica.

Restricciones:

- Los banners no deben ser modales bloqueantes en flujos clínicos críticos.
- Los banners no deben mostrarse al Paciente.
- Los banners no deben usar información clínica individual.
- Los banners desactivados o expirados no se muestran.
- El Profesional puede cerrar banners no obligatorios.

---

### F-07 Calendario de reuniones Pro

El sistema muestra al Profesional las próximas fechas de actividades comunitarias y clínicas de Catholizare Pro.

Eventos mínimos:

- Contagio de Fe;
- Revisión de Casos;
- Reuniones Clínicas;
- Reuniones de integración, si aplica;
- Mentorías grupales, si aplica.

En el dashboard del Profesional se debe mostrar:

- próxima fecha de Contagio de Fe;
- próxima fecha de Revisión de Casos o Reunión Clínica;
- horario;
- modalidad;
- descripción breve;
- botón de más información;
- botón de asistencia o registro, si aplica;
- enlace de origen, si aplica.

Las fechas pueden registrarse manualmente por el Administrador o sincronizarse desde `profesionales.catholizare.com` en una fase posterior.

Restricciones:

- En MVP, las fechas pueden cargarse manualmente.
- La sincronización automática con WordPress queda fuera del MVP, salvo que se defina un endpoint simple.
- El evento no debe mostrar información clínica de casos postulados.
- Si un evento se cancela, debe poder marcarse como cancelado.
- Los eventos vencidos no deben mostrarse como próximos.

---

### F-08 Mostrar próximas reuniones en dashboard

El dashboard del Profesional debe mostrar un bloque de próximas actividades de Catholizare Pro.

Mínimo debe mostrar:

- próxima fecha de Contagio de Fe;
- próxima fecha de Revisión de Casos o Reunión Clínica;
- enlace para asistir o registrarse;
- enlace para postular caso, si aplica;
- enlace para más información.

Ejemplo de bloque:

```text
Próximas actividades Catholizare Pro

Contagio de Fe
Viernes 8:30 a.m.
Ver detalles

Revisión de Casos
Viernes 8:30 a.m.
Postular caso
