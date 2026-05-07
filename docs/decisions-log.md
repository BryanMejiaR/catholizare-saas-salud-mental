# Registro de Decisiones de Producto

Decisiones cerradas que no requieren revisión salvo cambio significativo en el negocio. Todo agente de IA debe leer este archivo antes de proponer diseños o specs para evitar reabrir lo ya acordado.

---

## D-01 — Integración Google Calendar es bidireccional

**Decisión:** La sincronización con Google Calendar opera en ambas direcciones: eventos creados en Catholizare aparecen en Google Calendar del profesional, y eventos creados o modificados en Google Calendar se reflejan en la agenda de Catholizare.

**Implicaciones de diseño:** El sistema necesita webhooks o polling para detectar cambios en Google Calendar. Cualquier conflicto de horario debe resolverse con reglas explícitas (Catholizare tiene precedencia o alerta de conflicto).

---

## D-02 — GPT solo pre-llena campos del proceso terapéutico

**Decisión:** El asistente clínico con GPT únicamente puede pre-llenar campos dentro del proceso terapéutico. El profesional revisa y valida manualmente todo lo que el asistente genera antes de que quede registrado en el expediente. GPT no genera ni modifica notas clínicas de forma autónoma.

**Implicaciones de diseño:** No existe flujo de "guardar automático" desde GPT. La interfaz debe mostrar claramente qué contenido es sugerencia de GPT vs. contenido validado por el profesional.

---

## D-03 — Existen dos modelos terapéuticos: General y TCC

**Decisión:** El sistema incluye dos modelos terapéuticos diferenciados:
- **Modelo General**: configurable y editable por el profesional; sirve como base para enfoques no especificados.
- **Modelo TCC (Terapia Cognitivo-Conductual)**: modelo específico con estructura predefinida alineada a la metodología TCC.

El profesional puede consultar otros modelos, pero solo puede operar con los que tiene asignados.

---

## D-04 — El modelo general es editable y extensible por el profesional

**Decisión:** El profesional puede modificar los pasos, campos y flujos del modelo terapéutico general para adaptarlo a su práctica clínica. Los cambios aplican a procesos nuevos; los procesos en curso no se alteran retroactivamente.

**Implicaciones de diseño:** Se necesita versionado de plantillas de proceso terapéutico para preservar el histórico de cada proceso.

---

## D-05 — Catholizare Pro muestra recursos exclusivamente al profesional

**Decisión:** Los recursos terapéuticos y anuncios de Catholizare Pro son visibles únicamente en la pantalla del profesional. El paciente no tiene acceso a estos recursos desde su portal.

**Implicaciones de diseño:** Los recursos Pro no forman parte del portal del paciente. La lógica de visibilidad debe filtrar contenido Pro por rol.

---

## D-06 — WhatsApp es canal de soporte humano, no chatbot

**Decisión:** WhatsApp se usa exclusivamente como canal de soporte con agente humano del equipo de Catholizare. No existe chatbot automatizado en WhatsApp para pacientes ni para profesionales.

**Implicaciones de diseño:** No se integra ningún proveedor de chatbot para WhatsApp. El sistema puede mostrar un enlace o botón de contacto que abre WhatsApp hacia el número de soporte.

---

## D-07 — Videollamadas vía Zoom

**Decisión:** Las sesiones de videollamada se realizan a través de Zoom. Catholizare gestiona el enlace de la sesión y lo presenta en la agenda; la llamada ocurre en la plataforma de Zoom.

**Implicaciones de diseño:** Se requiere integración con la API de Zoom para crear y recuperar enlaces de reunión. Catholizare no desarrolla infraestructura de video propia.

---

## D-08 — Cuatro roles de usuario

**Decisión:** El sistema reconoce exactamente cuatro roles:

| Rol | Descripción |
|---|---|
| Paciente | Usuario final que recibe atención; accede al portal del paciente |
| Profesional | Psicólogo o terapeuta que gestiona expedientes y procesos terapéuticos |
| Administrador | Gestiona la cuenta institucional, usuarios y configuración |
| Super Administrador | Acceso completo al sistema; rol reservado para el equipo de Catholizare |

No existen roles intermedios ni roles personalizados por institución en el MVP.

---

## D-09 — Stack tecnológico pendiente de definición formal

**Decisión diferida:** El stack tecnológico (frontend, backend, base de datos, infraestructura) no ha sido definido formalmente. No se debe asumir ningún lenguaje, framework ni proveedor cloud hasta que se documente en `docs/` como decisión cerrada.

**Estado:** Pendiente. Bloqueante para las Fases 4 y 5 del plan SDD.

---

## D-10 — Portal del paciente con acceso limitado a resumen y citas

**Decisión:** El paciente accede a un portal propio donde puede ver:
- Su resumen clínico (lo que el profesional decida exponer)
- Sus citas programadas

El paciente no tiene acceso al expediente clínico completo ni a las notas del profesional salvo lo que el profesional publique explícitamente en el resumen.

**Implicaciones de diseño:** El profesional controla qué información del expediente es visible para el paciente. El portal del paciente es de solo lectura para el MVP.
