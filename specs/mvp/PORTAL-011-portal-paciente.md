# PORTAL-011 — Portal del Paciente

## Propósito

Proveer al Paciente una interfaz web responsive, separada del panel del Profesional, donde pueda consultar información limitada y autorizada sobre su proceso: resumen terapéutico compartido, próximas citas, historial básico de citas y enlaces de videollamada.

El portal no da acceso al expediente clínico completo, notas clínicas, conceptualizaciones internas, diagnósticos internos, pruebas psicológicas completas, procesos terapéuticos completos ni contenido generado por IA que no haya sido revisado y aprobado por el Profesional.

Aunque el portal es principalmente de consulta, permite acciones limitadas y controladas del Paciente, como solicitar cancelación o reprogramación, evaluar su experiencia de atención y aceptar o rechazar referidos.

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

---

## Funcionalidades

### F-01 Acceso al portal

El Paciente inicia sesión con sus credenciales según AUTH-001.

La interfaz del portal es distinta al panel del Profesional. No existe acceso cruzado.

Restricciones:

- El Paciente no puede ver información de otros pacientes.
- El Paciente no puede acceder al panel del Profesional.
- Todo inicio de sesión debe quedar registrado en auditoría.

---

### F-02 Ver resumen terapéutico compartido

El Paciente ve únicamente el resumen terapéutico compartido que el Profesional ha publicado para él desde EXPEDIENTE-003.

Este resumen no es copia automática del expediente clínico ni sustituye las notas clínicas.

El resumen puede ser redactado manualmente por el Profesional o generado como borrador con apoyo de IA mediante GPT-007. En ambos casos, solo se muestra cuando el Profesional lo revisa, corrige y aprueba explícitamente.

Restricciones:

- El Paciente no puede editar el resumen.
- El Paciente no puede ver notas clínicas completas.
- El Paciente no puede ver conceptualizaciones internas.
- El Paciente no puede ver hipótesis clínicas internas.
- El Paciente no puede ver diagnósticos internos salvo que el Profesional los haya comunicado explícitamente.
- El Paciente no puede ver borradores generados por IA.
- Toda visualización del resumen debe quedar registrada en auditoría.

---

### F-03 Ver próximas citas

El Paciente puede ver la lista de sus próximas citas programadas con fecha, hora, duración, tipo de cita, nombre del Profesional, estado general y modalidad.

También puede ver historial básico de citas pasadas.

Restricciones:

- El historial no muestra notas clínicas.
- El historial no muestra motivos clínicos internos.
- El historial no muestra observaciones privadas del Profesional.
- El Paciente no puede modificar citas directamente desde esta vista.

---

### F-04 Acceder al enlace de videollamada

Si la cita es de videollamada, el Paciente ve un botón para unirse a la sesión.

El portal solo muestra el enlace de participante de Zoom.

Regla recomendada para MVP:

- Mostrar el enlace desde 24 horas antes de la cita.
- Ocultarlo después de finalizada o cancelada la cita.
- No mostrar el enlace de anfitrión.
- Registrar en auditoría cuando el Paciente visualiza o abre el enlace.

---

### F-05 Solicitar cancelación o reprogramación

El Paciente puede enviar una solicitud de cancelación o reprogramación de una cita futura.

Esta funcionalidad es un canal de comunicación básico y no es aprobación automática.

Restricciones:

- La solicitud no modifica automáticamente la cita.
- El Profesional decide si cancela, reprograma o mantiene la cita.
- El sistema debe advertir al Paciente que evite incluir información clínica sensible.

---

### F-06 Evaluar experiencia de atención

Tras completarse una cita, el Paciente puede dejar una evaluación interna sobre su experiencia de atención.

La evaluación no es pública y no constituye una medición clínica del desempeño terapéutico.

Campos:

- puntuación de experiencia de 1 a 5;
- comentario opcional;
- cita asociada;
- profesional asociado;
- fecha de envío.

Restricciones:

- No se publica en perfiles.
- No se usa como ranking clínico.
- El sistema debe advertir que evite incluir información clínica sensible.

---

### F-07 Aceptar o rechazar referido a otro Profesional

Si el Profesional genera una recomendación de referencia, traslado o derivación a otro Profesional, el Paciente puede recibir una notificación en el portal.

La aceptación del referido no transfiere automáticamente el expediente completo.

Antes de compartir información clínica, el sistema debe informar al Paciente:

- Profesional o área sugerida;
- motivo general del referido;
- qué información podría compartirse;
- finalidad de la transferencia;
- si implica cambio de Profesional responsable;
- si acepta o rechaza.

Restricciones:

- No se comparte expediente completo sin autorización explícita.
- No se comparten notas clínicas completas por defecto.
- No se comparten pruebas psicológicas completas por defecto.

---

### F-08 Ver estado de solicitudes

El Paciente puede ver estado de solicitudes recientes de cancelación, reprogramación o referido.

Restricciones:

- No se muestran deliberaciones internas del Profesional.
- No se muestran comentarios administrativos internos.
- No se muestran notas clínicas relacionadas con la decisión.

---

## Reglas de negocio

1. El portal del Paciente es principalmente de consulta, pero permite acciones limitadas y controladas.
2. El Paciente solo accede a información de su propio proceso.
3. El Paciente no tiene acceso al expediente clínico completo en MVP.
4. El Paciente no tiene acceso a notas clínicas completas.
5. El Paciente no tiene acceso a conceptualizaciones internas.
6. El Paciente no tiene acceso a resultados completos de pruebas psicológicas desde el portal en MVP.
7. El Paciente solo ve el resumen terapéutico compartido publicado explícitamente por el Profesional.
8. El resumen puede ser redactado por el Profesional o generado como borrador por IA, pero solo se publica cuando el Profesional lo aprueba.
9. El Paciente nunca ve borradores de IA.
10. El Paciente puede solicitar cancelación o reprogramación, pero no modifica automáticamente la cita.
11. El enlace de videollamada solo muestra el enlace de participante, nunca el de anfitrión.
12. El asistente GPT no está disponible para interacción directa en el portal del Paciente.
13. Los recursos de Catholizare Pro no son visibles para el Paciente en MVP.
14. Las evaluaciones del Paciente son internas y no constituyen ranking clínico.
15. La aceptación de un referido no transfiere automáticamente el expediente completo.
16. Toda acción relevante del Paciente debe registrarse en auditoría.
17. El portal debe proteger datos sensibles bajo mínimo necesario.

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
- resultados completos de evaluaciones psicológicas;
- imágenes de pruebas, inventarios o protocolos;
- interpretaciones psicométricas internas;
- hipótesis clínicas;
- comentarios privados del Profesional;
- contenido generado por IA no aprobado;
- borradores de resumen terapéutico;
- enlace de anfitrión de Zoom;
- información de otros pacientes.

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `patient_portal_user_id` | Usuario del Paciente en el portal |
| `patient_id` | Paciente vinculado al portal |
| `expediente_id` | Expediente asociado |
| `patient_summary` | Resumen terapéutico compartido aprobado |
| `patient_summary_status` | `no_publicado`, `publicado`, `despublicado` |
| `patient_summary_source` | `manual`, `ia_asistida` |
| `patient_summary_approved_by_professional_id` | Profesional que aprobó el resumen |
| `patient_summary_published_at` | Fecha de publicación |
| `appointment_id` | Cita relacionada |
| `zoom_join_url` | Enlace de participante |
| `reschedule_request_id` | Solicitud de reprogramación |
| `cancellation_request_id` | Solicitud de cancelación |
| `experience_review_id` | Evaluación de experiencia |
| `referral_response_id` | Respuesta a referido |
| `created_at` | Fecha de creación |
| `updated_at` | Fecha de última actualización |

---

## Auditoría

Eventos mínimos:

- inicio y cierre de sesión;
- visualización del resumen;
- visualización de citas;
- apertura de enlace Zoom;
- envío de solicitud de cancelación o reprogramación;
- envío de evaluación;
- aceptación o rechazo de referido;
- errores de acceso;
- intentos no autorizados.

---

## Dependencias

- AUTH-001 — autenticación del Paciente.
- USERS-002 — datos mínimos del Paciente y Profesional.
- EXPEDIENTE-003 — fuente del resumen terapéutico compartido.
- AGENDA-008 — fuente de citas.
- ZOOM-010 — fuente del enlace de videollamada.
- GPT-007 — generación asistida de borradores de resumen terapéutico, si aplica.
- EVAL-014 — evaluaciones no visibles completas para el Paciente en MVP.

---

## Fuera de alcance del MVP

- Acceso del Paciente al expediente clínico completo.
- Acceso del Paciente a notas clínicas completas.
- Acceso del Paciente a conceptualizaciones internas.
- Acceso del Paciente a pruebas psicológicas completas.
- Visualización de resultados completos de evaluaciones psicológicas.
- Aplicación de pruebas psicológicas al Paciente desde el portal.
- Edición de datos personales por el Paciente.
- Chat en tiempo real con el Profesional.
- Interacción directa del Paciente con GPT.
- Publicación automática de contenido generado por IA.
- Reserva automática de citas.
- Reprogramación automática sin aprobación.
- Transferencia automática del expediente completo en referidos.
- Recursos de Catholizare Pro visibles para el Paciente.
