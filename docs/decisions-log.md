# Registro de Decisiones de Producto

Decisiones cerradas que no requieren revisión salvo cambio significativo en el negocio. Todo agente de IA debe leer este archivo antes de proponer diseños o specs para evitar reabrir lo ya acordado.

---

## D-01 — Integración Google Calendar es bidireccional

**Decisión:** La sincronización con Google Calendar opera en ambas direcciones: eventos creados en Catholizare aparecen en Google Calendar del profesional, y eventos creados o modificados en Google Calendar se reflejan en la agenda de Catholizare.

**Implicaciones de diseño:** El sistema necesita webhooks o polling para detectar cambios en Google Calendar. Cualquier conflicto de horario debe resolverse con reglas explícitas (Catholizare tiene precedencia o alerta de conflicto).

---

## D-02 — GPT solo pre-llena campos del proceso terapéutico

**Decisión:** El asistente clínico con GPT únicamente puede pre-llenar campos dentro del proceso terapéutico. El profesional revisa y valida manualmente todo lo que el asistente genera antes de que quede registrado en el expediente. GPT no genera ni modifica notas clínicas de forma autónoma, GPT no debe de tener acceso a la informacion  de identificacion de paciente.

**Implicaciones de diseño:** No existe flujo de "guardar automático" desde GPT. La interfaz debe mostrar claramente qué contenido es sugerencia de GPT vs. contenido validado por el profesional.

---
## D-02.5 — Proceso de prellenado del proceso terapéutico
**Decisión:** el profesional podra dar especificaciones particulares para dar mejor direccion a GPT, este las tomar en cuenta para la conceptualizacion del caso
**Implicaciones de diseño:** En un cuadro de texto donde el profesional podra dar algunas direcciones importantes y particulares para guiar a GPT en el presente caso.

## D-03 — Existen tres modelos terapéuticos: General, y TCC

**Decisión:** El sistema incluye dos modelos terapéuticos diferenciados:
- **Modelo General**: configurable y editable por el profesional; sirve como base para enfoques no especificados.
- **Modelo TCC (Terapia Cognitivo-Conductual)**: modelo específico con estructura predefinida alineada a la metodología TCC.

El profesional puede consultar otros modelos, pero solo puede operar con los que tiene asignados, en el futuro se adjuntan mas modelos terapéuticos.

---

## D-04 — El modelo general es editable y extensible por el profesional

**Decisión:** El profesional puede modificar los pasos, campos y flujos del modelo terapéutico general para adaptarlo a su práctica clínica. Los cambios aplican a procesos nuevos; los procesos en curso no se alteran retroactivamente.

**Implicaciones de diseño:** Se necesita versionado de plantillas de proceso terapéutico para preservar el histórico de cada proceso.

---

## D-05 — Catholizare Pro muestra recursos exclusivamente al profesional

**Decisión:** Los recursos terapéuticos y anuncios de Catholizare Pro son visibles únicamente en la pantalla del profesional, como banners en varias secciones de su sistema, el sentido es invitarlos a entrar a Catholizare Pro. El paciente no tiene acceso a estos recursos desde su portal.

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
| Administrador | Gestiona usuarios y configuración de la plataforma (rol de plataforma, no institucional) |
| Super Administrador | Acceso completo al sistema; rol reservado para el equipo de Catholizare |

No existen roles intermedios ni roles personalizados por institución en el MVP.

---

## D-09 — Stack tecnológico del MVP

**Decisión:** El stack tecnológico del MVP queda definido de la siguiente manera. Todo agente de IA debe leer esta decisión antes de proponer arquitectura, esquemas de base de datos o código de implementación.

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | Next.js 15 (App Router) + React + TypeScript + Tailwind CSS | Sin backend separado |
| Backend | Route Handlers y Server Actions de Next.js | Las llaves secretas permanecen en el servidor |
| Base de datos | Supabase Cloud (PostgreSQL) | RLS activo desde la primera tabla |
| Auth | Supabase Auth + Google OAuth 2.0 | Roles en `app_metadata` del JWT; 4 roles: Paciente, Profesional, Administrador, Super Administrador |
| Storage | Supabase Storage con buckets privados y URLs firmadas | Política TTL de 24 h para imágenes de evaluaciones psicológicas (EVAL-014) |
| IA clínica | OpenAI API (GPT-4o, texto y visión) | Integrada vía Route Handlers; las API keys nunca se exponen al cliente |
| Email | Resend | Correos transaccionales y recordatorios de citas |
| Videollamadas | Zoom API | Generación de enlaces de reunión; conforme a ZOOM-010 |
| Pagos | Stripe (Care y Pro) | Facturapi en Fase 2; Mercado Pago como opción futura |
| Background jobs | Supabase Edge Functions + pg_cron | Recordatorios de citas, limpieza de imágenes temporales, envío de correos asíncronos |
| PDF | @react-pdf/renderer | Exportación de notas clínicas confirmadas (NOTAS-004) |
| Monitoreo de errores | Sentry | Configurado desde el día 1 |
| Hosting | Railway | Next.js en modo Node.js persistente (no serverless) |
| Control de versiones | GitHub | — |

**Decisiones adicionales incluidas:**

- **Google OAuth scope unificado**: en el primer login se solicitan simultáneamente los scopes de autenticación y de Google Calendar (`https://www.googleapis.com/auth/calendar`) para no requerir una segunda autorización al activar GCAL-009.
- **RLS obligatorio**: toda tabla en Supabase debe tener Row Level Security activo antes de su primera migración a producción. Ninguna tabla puede existir en producción sin política RLS explícita.
- **TTL de imágenes clínicas**: las imágenes cargadas en EVAL-014 para análisis con IA se eliminan automáticamente del bucket de Storage a las 24 horas de su carga mediante Supabase Edge Function + pg_cron. El resultado clínico validado (texto) se conserva en la base de datos; la imagen original no.
- **Roles JWT**: los cuatro roles del sistema se almacenan en `app_metadata` de Supabase Auth y se leen desde las políticas RLS sin consultas adicionales a tablas de usuarios.

**Implicaciones de diseño:**

- No existe backend separado. Toda lógica de servidor vive en Route Handlers (`/app/api/`) y Server Actions dentro de Next.js.
- Las llamadas a OpenAI se hacen exclusivamente desde el servidor para proteger las API keys y construir el paquete clínico controlado conforme a GPT-007.
- Railway corre Next.js como proceso Node.js persistente, lo que permite manejar operaciones largas (llamadas a OpenAI, generación de PDFs) sin límites de timeout serverless.
- Supabase Cloud gestiona autenticación, base de datos, storage y edge functions desde una sola plataforma, reduciendo superficie de integración en el MVP.

---

## D-10 — Portal del paciente con acceso limitado a resumen y citas

**Decisión:** El paciente accede a un portal propio donde puede ver:
- Su resumen clínico (lo que el profesional decida exponer)
- Sus citas programadas

El paciente no tiene acceso al expediente clínico completo ni a las notas del profesional salvo lo que el profesional publique explícitamente en el resumen.

**Implicaciones de diseño:** El profesional controla qué información del expediente es visible para el paciente. El portal del paciente es de solo lectura para el MVP.

---

## D-11 — Un Paciente puede tener hasta 3 Profesionales activos simultáneos

**Decisión:** Un Paciente puede tener hasta 3 Profesionales activos asignados al mismo tiempo. Cada Profesional trabaja un caso de forma completamente independiente: cada asignación genera su propio expediente clínico exclusivo. No existe un expediente compartido entre Profesionales sobre el mismo Paciente. Un Profesional no tiene acceso al expediente que otro Profesional lleva sobre ese Paciente.

**Implicaciones de diseño:** El modelo de datos cambia de un expediente único por Paciente a un expediente por par Profesional-Paciente. El campo `professional_id` en `expedientes` es singular e identifica al único propietario del expediente. Las políticas RLS del expediente verifican `professional_id = auth.uid()`, no un arreglo. En `profiles`, el campo `assigned_professional_ids uuid[]` sirve únicamente para que el Administrador registre qué Profesionales tienen al Paciente asignado; no implica acceso cruzado entre expedientes. Al desasignar un Profesional, su expediente sobre ese Paciente queda archivado o en el estado que el Profesional haya dejado; no se elimina.

---

## D-12 — No existen organizaciones en Catholizare

**Decisión:** Catholizare no tiene el concepto de organización, clínica o cuenta institucional. Los Profesionales son cuentas individuales independientes — ninguno pertenece a un contenedor institucional. El rol Administrador es un rol de plataforma (no institucional): gestiona usuarios a nivel global de la plataforma y ve reportes agregados de toda la plataforma, sin pertenecer a ningún Profesional ni institución específica.

**Implicaciones de diseño:**
- No existe tabla `organizations` ni campo `organization_id` en ninguna tabla.
- El Administrador crea y gestiona Profesionales y Pacientes a nivel de plataforma, no de organización.
- La función `current_organization_id()` no existe; las políticas RLS no usan aislamiento por organización.
- El aislamiento de datos clínicos se hace por `professional_id` (cada Profesional solo ve sus propios expedientes).
- Los reportes del Administrador son agregados de toda la plataforma.
