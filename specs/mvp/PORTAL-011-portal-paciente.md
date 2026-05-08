# PORTAL-011 — Portal del Paciente

## Propósito

Proveer al Paciente una interfaz de solo lectura donde pueda consultar su resumen clínico, sus citas programadas y los enlaces de sus videollamadas. El portal es una experiencia separada del panel del Profesional.

---

## Actores

| Actor | Interacción |
|---|---|
| Paciente | Usuario principal del portal; acceso solo lectura |
| Profesional | Controla qué información es visible para el paciente (indirectamente, desde su panel) |

---

## Funcionalidades

### F-01 Acceso al portal
- El Paciente inicia sesión con sus credenciales (ver AUTH-001).
- La interfaz del portal es distinta al panel del Profesional; no hay acceso cruzado.
- El Paciente solo ve información de su propio expediente y sus propias citas.

### F-02 Ver resumen clínico
- El Paciente ve el resumen que el Profesional ha publicado para él (ver EXPEDIENTE-003 F-06).
- Si el Profesional no ha publicado ningún resumen, se muestra un mensaje indicando que no hay resumen disponible aún.
- El resumen es de solo lectura; el Paciente no puede editarlo.

### F-03 Ver próximas citas
- El Paciente ve la lista de sus citas programadas con: fecha, hora, tipo (presencial o videollamada) y nombre del Profesional.
- El Paciente ve también el historial de citas pasadas (solo lectura).

### F-04 Acceder al enlace de videollamada
- Si la cita es de videollamada, el Paciente ve el botón o enlace para unirse a la sesión de Zoom.
- El enlace es visible en la vista de detalle de la cita.

### F-05 Solicitar cancelación o reprogramación
- El Paciente puede enviar un mensaje de texto al Profesional para solicitar cancelación o reprogramación de una cita futura.
- El mensaje llega al Profesional como notificación dentro de su panel.
- Esta funcionalidad es un canal de comunicación básico; no es un flujo de aprobación automática.

### F-06 Evaluar al Profesional
- Tras completarse una cita, el Paciente puede dejar una evaluación del Profesional.
- La evaluación es interna (no pública); el Profesional la ve en su panel.
- Campos de la evaluación: puntuación (1-5) y comentario de texto libre (opcional).

### F-07 Aceptar referido a otro Profesional
- Si el Profesional genera una nota de referencia/traslado, el Paciente recibe una notificación en el portal.
- El Paciente puede aceptar o no que su caso sea referido a otro Profesional.
- La decisión del Paciente queda registrada en el expediente.

---

## Reglas de negocio

1. El portal del paciente es **de solo lectura** en el MVP; el Paciente no puede modificar ningún dato clínico.
2. El Paciente solo accede a información de su propio expediente; no puede ver información de otros pacientes.
3. El Paciente no tiene acceso a las notas clínicas completas, al proceso terapéutico ni al expediente clínico completo; solo al resumen publicado por el Profesional.
4. Los recursos de Catholizare Pro **no son visibles** en el portal del paciente.
5. El asistente GPT **no está disponible** en el portal del paciente.

---

## Datos que muestra

| Dato | Origen |
|---|---|
| Resumen clínico | `patient_summary` del expediente (EXPEDIENTE-003) |
| Próximas citas | Citas con `status = programada` de AGENDA-008 |
| Historial de citas | Citas pasadas de AGENDA-008 |
| Enlace de Zoom | `zoom_link` de la cita (ZOOM-010) |
| Nombre del Profesional | Datos del Profesional asignado (USERS-002) |

---

## Dependencias

- AUTH-001 — autenticación del Paciente.
- EXPEDIENTE-003 — fuente del resumen clínico.
- AGENDA-008 — fuente de las citas.
- ZOOM-010 — fuente del enlace de videollamada.
- USERS-002 — datos del Profesional asignado.

---

## Fuera de alcance del MVP

- Autogestión de datos personales por el paciente (cambio de nombre, dirección)
- Chat en tiempo real con el Profesional
- Acceso a materiales o tareas terapéuticas del proceso
- Notificaciones push en dispositivo móvil
- Aplicación móvil nativa (el portal del MVP es web responsive)
