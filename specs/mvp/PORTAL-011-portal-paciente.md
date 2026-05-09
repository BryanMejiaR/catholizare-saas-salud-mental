# PORTAL-011 — Portal del Paciente

## Propósito

Proveer al Paciente una interfaz web responsive, separada del panel del Profesional, donde pueda consultar información limitada y autorizada sobre su proceso: resumen terapéutico compartido, próximas citas, historial básico de citas y enlaces de videollamada.

El portal no da acceso al expediente clínico completo, notas clínicas, conceptualizaciones internas, diagnósticos internos, pruebas psicológicas completas, procesos terapéuticos completos ni contenido generado por IA que no haya sido revisado y aprobado por el Profesional.

Aunque el portal es principalmente de consulta, permite acciones limitadas y controladas del Paciente, como solicitar cancelación o reprogramación, evaluar su experiencia de atención y aceptar o rechazar referidos.

El portal debe proteger la confidencialidad, dignidad e intimidad del Paciente, mostrando únicamente la información necesaria para que participe responsablemente en su proceso terapéutico.

---

## Actores

| Actor | Interacción |
|---|---|
| Paciente | Usuario principal del portal; consulta información autorizada y realiza acciones limitadas. |
| Profesional | Controla qué información terapéutica es visible para el Paciente desde su panel. |
| Sistema | Muestra información autorizada, protege accesos, registra auditoría y aplica restricciones de privacidad. |
| IA clínica asistida | No interactúa directamente con el Paciente; puede apoyar al Profesional generando borradores de resumen terapéutico, que solo se publican si el Profesional los aprueba. |

---

## Principio rector

El Paciente ve lo que necesita para participar responsablemente en su proceso, pero no accede al expediente clínico completo ni a información interna del Profesional.

El portal no sustituye la relación terapéutica, no reemplaza la explicación clínica del Profesional y no debe exponer información que pueda dañar, confundir o revelar indebidamente datos clínicos sensibles.

---

## Funcionalidades

### F-01 Acceso al portal

El Paciente inicia sesión con sus credenciales según AUTH-001.

La interfaz del portal es distinta al panel del Profesional.

No existe acceso cruzado entre portal del Paciente y panel del Profesional.

El Paciente solo puede ver información relacionada con su propio proceso.

Restricciones:

- El Paciente no puede ver información de otros pacientes.
- El Paciente no puede acceder al panel del Profesional.
- El Profesional no ingresa al sistema usando la interfaz del Paciente.
- Todo inicio de sesión debe quedar registrado en auditoría.
- El sistema debe proteger la sesión del Paciente mediante reglas de autenticación y autorización.

---

### F-02 Ver resumen terapéutico compartido

El Paciente ve únicamente el resumen terapéutico compartido que el Profesional ha publicado para él desde EXPEDIENTE-003.

Este resumen no es copia automática del expediente clínico ni sustituye las notas clínicas.

El resumen terapéutico compartido puede ser redactado manualmente por el Profesional o generado como borrador con apoyo de IA mediante GPT-007.

En ambos casos, solo se muestra al Paciente cuando el Profesional lo revisa, corrige y aprueba explícitamente.

Si el Profesional no ha publicado ningún resumen, se muestra un mensaje indicando que no hay resumen disponible aún.

El resumen es de solo lectura para el Paciente.

El resumen puede incluir:

- acuerdos generales de seguimiento;
- objetivos terapéuticos comunicables al Paciente;
- pautas psicoeducativas;
- recordatorios terapéuticos;
- tareas o indicaciones generales;
- orientaciones prudentes para el proceso;
- recursos personales o espirituales, cuando el Profesional considere clínicamente pertinente compartirlos.

Restricciones:

- El Paciente no puede editar el resumen.
- El Paciente no puede ver notas clínicas completas.
- El Paciente no puede ver conceptualizaciones internas.
- El Paciente no puede ver hipótesis clínicas internas.
- El Paciente no puede ver diagnósticos internos salvo que el Profesional los haya comunicado explícitamente mediante un resumen autorizado.
- El Paciente no puede ver borradores generados por IA.
- El Paciente solo ve la versión aprobada y publicada por el Profesional.
- Toda visualización del resumen debe quedar registrada en auditoría.

---

### F-03 Ver próximas citas

El Paciente puede ver la lista de sus próximas citas programadas.

Cada cita puede mostrar:

- fecha;
- hora;
- duración;
- tipo de cita;
- nombre del Profesional;
- estado general;
- modalidad: presencial o videollamada, si aplica.

El Paciente también puede ver un historial básico de citas pasadas.

El historial básico puede mostrar:

- fecha;
- hora;
- Profesional;
- tipo de cita;
- estado general.

Restricciones:

- El historial de citas no muestra notas clínicas.
- El historial de citas no muestra motivos clínicos internos.
- El historial de citas no muestra observaciones privadas del Profesional.
- El historial de citas no muestra razones internas de cancelación si contienen información sensible.
- El Paciente no puede modificar citas directamente desde esta vista.

---

### F-04 Acceder al enlace de videollamada

Si la cita es de videollamada, el Paciente ve un botón para unirse a la sesión.

El portal solo muestra el enlace de participante de Zoom.

El enlace será visible únicamente dentro de la ventana de acceso definida por el sistema.

Regla recomendada para MVP:

- Mostrar el enlace desde 24 horas antes de la cita.
- Ocultarlo después de finalizada o cancelada la cita.
- No mostrar el enlace de anfitrión.
- Registrar en auditoría cuando el Paciente visualiza o abre el enlace.

Restricciones:

- El Paciente nunca debe ver `zoom_start_url`.
- El Paciente solo puede ver `zoom_join_url`.
- Si la cita está cancelada, el enlace no debe estar disponible.
- Si la cita ya finalizó, el enlace no debe estar disponible.
- Si la cita aún no entra en la ventana de acceso, el portal debe mostrar un mensaje indicando cuándo estará disponible.

---

### F-05 Solicitar cancelación o reprogramación

El Paciente puede enviar una solicitud de cancelación o reprogramación de una cita futura.

Esta funcionalidad es un canal de comunicación básico.

No es un flujo de aprobación automática.

El mensaje llega al Profesional como notificación dentro de su panel.

La solicitud puede incluir:

- cita relacionada;
- tipo de solicitud: cancelación o reprogramación;
- comentario opcional del Paciente;
- fecha y hora de envío;
- estado de la solicitud.

Estados sugeridos:

- enviada;
- vista;
- aceptada;
- rechazada;
- resuelta.

Restricciones:

- La solicitud no modifica automáticamente la cita.
- El Profesional decide si cancela, reprograma o mantiene la cita.
- El Paciente no puede editar directamente fecha, hora ni duración de la cita.
- El sistema debe advertir al Paciente que evite incluir información clínica sensible en el comentario.
- Toda solicitud debe quedar registrada en auditoría.

---

### F-06 Evaluar experiencia de atención

Tras completarse una cita, el Paciente puede dejar una evaluación interna sobre su experiencia de atención.

La evaluación no es pública y no constituye una medición clínica del desempeño terapéutico.

Campos de la evaluación:

- puntuación de experiencia, de 1 a 5;
- comentario opcional;
- cita asociada;
- profesional asociado;
- fecha de envío.

La evaluación puede servir para mejorar la calidad del servicio, detectar problemas de experiencia del usuario y orientar procesos internos de mejora.

Restricciones:

- La evaluación no se publica en perfiles ni páginas públicas.
- La evaluación no se usa como ranking clínico del Profesional.
- La evaluación no sustituye procesos de supervisión clínica.
- El sistema debe advertir al Paciente que evite incluir información clínica sensible en el comentario.
- Las evaluaciones pueden alimentar reportes internos agregados de experiencia del usuario.
- La visualización de comentarios individuales debe definirse por política interna.
- Toda evaluación enviada debe quedar registrada en auditoría.

---

### F-07 Aceptar o rechazar referido a otro Profesional

Si el Profesional genera una recomendación de referencia, traslado o derivación a otro Profesional, el Paciente puede recibir una notificación en el portal.

El Paciente puede aceptar o rechazar continuar el proceso de referido.

La aceptación del referido no transfiere automáticamente el expediente completo.

Antes de compartir información clínica con otro Profesional, el sistema debe informar al Paciente:

- Profesional o área sugerida;
- motivo general del referido;
- qué información podría compartirse;
- finalidad de la transferencia;
- si el referido implica cambio de Profesional responsable;
- si el Paciente acepta o rechaza.

La decisión del Paciente debe quedar registrada en el expediente y en auditoría.

Restricciones:

- No se comparte expediente completo sin autorización explícita.
- No se comparten notas clínicas completas por defecto.
- No se comparten pruebas psicológicas completas por defecto.
- El Profesional actual debe conservar trazabilidad de la recomendación.
- El nuevo Profesional solo accede a la información autorizada según reglas de permisos.
- El Paciente puede rechazar el referido sin perder acceso a su portal.

---

### F-08 Ver estado de solicitudes

El Paciente puede ver el estado de sus solicitudes recientes de cancelación, reprogramación o referido.

El sistema puede mostrar:

- tipo de solicitud;
- cita relacionada, si aplica;
- fecha de envío;
- estado actual;
- respuesta general del Profesional, si existe.

Restricciones:

- No se muestran deliberaciones internas del Profesional.
- No se muestran comentarios administrativos internos.
- No se muestran notas clínicas relacionadas con la decisión.

---

## Reglas de negocio

1. El portal del Paciente es principalmente de consulta, pero permite acciones limitadas y controladas.

2. El Paciente solo accede a información de su propio proceso.

3. El Paciente no tiene acceso al expediente clínico completo en el MVP.

4. El Paciente no tiene acceso a notas clínicas completas.

5. El Paciente no tiene acceso a conceptualizaciones internas del caso.

6. El Paciente no tiene acceso a resultados completos de pruebas psicológicas desde el portal en MVP.

7. El Paciente solo ve el resumen terapéutico compartido que el Profesional haya publicado explícitamente.

8. El resumen terapéutico compartido puede ser redactado por el Profesional o generado como borrador por IA, pero solo se publica cuando el Profesional lo revisa, corrige y aprueba.

9. El Paciente nunca ve borradores de IA.

10. El Paciente puede ver próximas citas e historial básico de citas.

11. El Paciente puede solicitar cancelación o reprogramación, pero esta solicitud no modifica automáticamente la cita.

12. El Profesional decide si acepta o ejecuta la cancelación o reprogramación.

13. El enlace de videollamada solo muestra el enlace de participante, nunca el enlace de anfitrión.

14. El enlace de videollamada solo será visible dentro de la ventana definida por el sistema.

15. El asistente GPT no está disponible para interacción directa en el portal del Paciente.

16. Los recursos de Catholizare Pro no son visibles en el portal del Paciente en el MVP, salvo que un módulo posterior autorice recursos psicoeducativos específicos para pacientes.

17. Las evaluaciones del Paciente son internas y no constituyen ranking clínico del Profesional.

18. La aceptación de un referido no transfiere automáticamente el expediente completo.

19. Toda acción relevante del Paciente en el portal debe registrarse en auditoría.

20. El portal debe proteger datos sensibles bajo principio de mínimo necesario.

21. El Profesional controla qué información terapéutica se publica para el Paciente.

22. El sistema debe evitar que información clínica interna se publique accidentalmente en el portal.

23. Todo contenido visible para el Paciente debe tener una fuente autorizada y trazable.

---

## Datos que muestra

| Dato | Origen |
|---|---|
| Resumen terapéutico compartido | `patient_summary` del expediente, EXPEDIENTE-003 |
| Estado del resumen | `patient_summary_status` del expediente |
| Próximas citas | Citas con `status = programada` de AGENDA-008 |
| Historial básico de citas | Citas pasadas de AGENDA-008 |
| Enlace de Zoom para participante | `zoom_join_url` de ZOOM-010 |
| Nombre del Profesional | Datos públicos mínimos del Profesional, USERS-002 |
| Solicitudes enviadas | Solicitudes vinculadas a citas o referidos |
| Evaluaciones enviadas | Evaluaciones internas de experiencia |
| Referidos pendientes | Referidos o traslados generados por el Profesional |

---

## Datos que no muestra

El portal no muestra:

- expediente clínico completo;
- notas clínicas completas;
- diagnósticos internos;
- conceptualizaciones internas;
- pruebas psicológicas completas;
- hipótesis clínicas;
- comentarios privados del Profesional;
- contenido generado por IA no aprobado para el Paciente;
- borradores de resumen terapéutico;
- enlace de anfitrión de Zoom;
- información de otros pacientes;
- deliberaciones internas sobre referidos;
- comentarios administrativos internos;
- métricas internas de calidad o desempeño.

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `patient_portal_user_id` | Usuario del Paciente en el portal |
| `patient_id` | Paciente vinculado al portal |
| `expediente_id` | Expediente asociado |
| `patient_summary` | Resumen terapéutico compartido aprobado por el Profesional |
| `patient_summary_status` | `no_publicado`, `publicado`, `despublicado` |
| `patient_summary_source` | `manual`, `ia_asistida` |
| `patient_summary_approved_by_professional_id` | Profesional que aprobó el resumen visible |
| `patient_summary_published_at` | Fecha de publicación del resumen |
| `appointment_id` | Cita mostrada o relacionada con una acción |
| `zoom_join_url` | Enlace de participante para videollamada |
| `reschedule_request_id` | Solicitud de reprogramación, si aplica |
| `cancellation_request_id` | Solicitud de cancelación, si aplica |
| `experience_review_id` | Evaluación de experiencia, si aplica |
| `referral_response_id` | Respuesta del Paciente a un referido, si aplica |
| `created_at` | Fecha de creación del registro |
| `updated_at` | Fecha de última actualización |

---

## Auditoría

El portal debe registrar eventos relevantes.

Eventos mínimos:

- inicio de sesión del Paciente;
- cierre de sesión;
- visualización del resumen terapéutico compartido;
- visualización de próximas citas;
- visualización de historial de citas;
- visualización o apertura de enlace Zoom;
- envío de solicitud de cancelación;
- envío de solicitud de reprogramación;
- envío de evaluación de experiencia;
- aceptación o rechazo de referido;
- errores de acceso;
- intentos de acceso no autorizado.

Restricciones:

- El log no debe convertirse en una copia paralela del expediente.
- El log debe registrar trazabilidad suficiente sin exponer contenido clínico innecesario.
- Los logs no pueden ser editados ni eliminados desde operación ordinaria.

---

## Dependencias

- AUTH-001 — autenticación del Paciente.
- USERS-002 — datos mínimos del Paciente y Profesional.
- EXPEDIENTE-003 — fuente del resumen terapéutico compartido.
- AGENDA-008 — fuente de citas.
- ZOOM-010 — fuente del enlace de videollamada.
- GPT-007 — generación asistida de borradores de resumen terapéutico, si aplica.
- LOG-014 — auditoría y trazabilidad.
- PRIV-015 — privacidad, consentimiento, minimización y tratamiento de datos.

---

## Fuera de alcance del MVP

- Acceso del Paciente al expediente clínico completo.
- Acceso del Paciente a notas clínicas completas.
- Acceso del Paciente a conceptualizaciones internas.
- Acceso del Paciente a pruebas psicológicas completas.
- Edición de datos personales por el Paciente.
- Chat en tiempo real con el Profesional.
- Interacción directa del Paciente con GPT.
- Publicación automática de contenido generado por IA.
- Acceso a materiales o tareas terapéuticas completas del proceso.
- Notificaciones push en dispositivo móvil.
- Aplicación móvil nativa.
- Reserva automática de citas por parte del Paciente.
- Reprogramación automática sin aprobación del Profesional.
- Transferencia automática del expediente completo en referidos.
- Recursos de Catholizare Pro visibles para el Paciente.
