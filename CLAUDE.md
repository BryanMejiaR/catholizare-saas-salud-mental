# CLAUDE.md — Instrucciones para Agentes de IA

Este archivo define las reglas de trabajo para cualquier agente de IA que opere en este repositorio. Léelo completo antes de proponer cualquier diseño, migración, spec o código.

---

## Qué es este proyecto

Catholizare es un SaaS de salud mental para psicólogos y terapeutas en México. Permite gestionar expedientes clínicos, procesos terapéuticos, citas, evaluaciones psicológicas y un portal para pacientes, con asistencia de IA clínica.

---

## Documentos que debes leer antes de proponer cualquier cosa

| Documento | Por qué es obligatorio |
|---|---|
| `docs/mvp-scope.md` | Define qué está y qué no está en el MVP. No implementes fuera de este alcance. |
| `docs/decisions-log.md` | Decisiones cerradas. No las reabras ni las contradigas. |
| `docs/actors-and-roles.md` | Los cuatro roles del sistema y sus permisos. |
| `docs/normative-compliance.md` | Cumplimiento con NOM-004 y NOM-024. Toda funcionalidad clínica debe ser compatible. |
| `docs/domain-glossary.md` | Glosario de términos del dominio clínico y del sistema. |
| `specs/mvp/` | Specs individuales de cada módulo. Lee la spec del módulo en el que vas a trabajar. |

---

## Stack tecnológico (D-09)

Ver decisión completa en `docs/decisions-log.md` sección D-09.

Resumen:

| Capa | Tecnología |
|---|---|
| Frontend/Backend | Next.js 15 (App Router) + TypeScript + Tailwind CSS. Sin backend separado. |
| Lógica de servidor | Route Handlers (`/app/api/`) y Server Actions dentro de Next.js. |
| Base de datos | Supabase Cloud (PostgreSQL) con RLS activo desde la primera tabla. |
| Auth | Supabase Auth + Google OAuth 2.0. Roles en `app_metadata` del JWT. |
| IA clínica | OpenAI API (GPT-4o) vía Route Handlers. API keys nunca se exponen al cliente. |
| Email | Resend. |
| PDF | @react-pdf/renderer. |
| Videollamadas | Zoom API. |
| Pagos | Stripe (Care y Pro). |
| Background jobs | Supabase Edge Functions + pg_cron. |
| Monitoreo | Sentry (configurado desde el día 1). |
| Hosting | Railway (Node.js persistente, no serverless). |

---

## Reglas que nunca puedes romper

### Seguridad y privacidad

1. **RLS obligatorio**: toda tabla en Supabase debe tener Row Level Security activo antes de su primera migración a producción. Proponer una tabla sin política RLS explícita es un error bloqueante.

2. **Contenido clínico protegido**: notas clínicas, diagnósticos, hipótesis, conceptualizaciones, resultados de evaluaciones e imágenes psicométricas nunca son accesibles para los roles Administrador y Super Administrador en operación normal.

3. **API keys en el servidor**: las llaves de OpenAI, Supabase, Zoom, Resend y Stripe nunca se exponen al cliente. Toda llamada a APIs externas se hace desde Route Handlers.

4. **TTL de imágenes clínicas**: las imágenes de EVAL-014 se eliminan del bucket de Storage a las 24 horas mediante Edge Function + pg_cron. El resultado clínico validado (texto) se conserva en la base de datos; la imagen original no.

### IA clínica (GPT-007)

5. **Borradores solamente**: todo contenido generado por GPT-007 es borrador hasta que el Profesional lo aprueba y guarda explícitamente. Ningún flujo puede guardar contenido de IA sin acción humana explícita.

6. **Paquete clínico controlado**: GPT-007 solo recibe los datos estrictamente necesarios para la tarea solicitada. Nunca accede libremente al expediente completo. Nunca recibe datos de identificación directa del Paciente salvo que sean estrictamente necesarios para la tarea.

### Integridad de datos

7. **Sin eliminación física**: expedientes, notas clínicas, citas y evaluaciones no se eliminan físicamente desde operación ordinaria. Las operaciones son lógicas (estado `anulado`, `archivado` o `inactivo`).

8. **Auditoría obligatoria**: toda acción sensible (creación, edición, confirmación, consulta, exportación, uso de IA, inicio de sesión, acceso al portal) queda registrada con usuario, rol, fecha, hora y resultado de la acción. Ver sección de Auditoría en cada spec.

### Arquitectura

9. **Portal separado**: el portal del Paciente y el panel del Profesional son interfaces completamente separadas. No existe acceso cruzado entre roles.

10. **Google OAuth unificado**: el scope de Calendar (`https://www.googleapis.com/auth/calendar`) se solicita en el mismo flujo OAuth del primer login para no requerir una segunda autorización al activar GCAL-009.

---

## Metodología de trabajo (SDD)

Este proyecto sigue **Spec-Driven Development**. El orden de trabajo es:

```
Specs → Contratos técnicos → Task briefs → Implementación
```

**No implementes nada que no tenga spec aprobada en `specs/mvp/`.** Si necesitas implementar algo fuera de ese directorio, pregunta antes de proceder.

---

## Orden de implementación

Respetar los bloques definidos en `docs/mvp-scope.md`. Los bloques deben implementarse en orden; dentro de cada bloque puede haber trabajo en paralelo.

```
Bloque 1 — Base
  AUTH-001 → USERS-002

Bloque 2 — Núcleo clínico
  EXPEDIENTE-003 → EVAL-014 → NOTAS-004

Bloque 3 — Procesos terapéuticos y IA
  GPT-007 → PROCESO-GENERAL-005 → PROCESO-TCC-006

Bloque 4 — Agenda e integraciones
  ZOOM-010 → GCAL-009 → AGENDA-008

Bloque 5 — Interfaces de usuario
  PORTAL-011 → ADMIN-012

Bloque 6 — Módulos de soporte
  PRO-013 → HELP-018
```

No implementes un módulo sin que sus dependencias estén en estado funcional o mockeado.

---

## Estructura del repositorio

```
/
├── app/                        # Next.js App Router
│   ├── api/                   # Route Handlers (lógica de servidor, llamadas a APIs externas)
│   └── (routes)/              # Páginas organizadas por rol o módulo
├── components/                # Componentes React compartidos
├── lib/                       # Utilidades, clientes Supabase, helpers de servidor
├── supabase/
│   ├── migrations/            # Migraciones SQL — RLS incluida en cada migración
│   └── functions/             # Edge Functions (TTL de imágenes, jobs asíncronos)
├── docs/                      # Documentación del proyecto
│   ├── decisions-log.md       # Decisiones cerradas (D-01 en adelante)
│   ├── mvp-scope.md           # Alcance, dependencias y criterios de lanzamiento
│   ├── actors-and-roles.md    # Roles y permisos
│   ├── normative-compliance.md # NOM-004 y NOM-024
│   ├── domain-glossary.md     # Glosario del dominio
│   └── vision.md              # Visión y propósito del producto
└── specs/
    └── mvp/                   # Una spec por módulo del MVP (AUTH-001 a HELP-018)
```

---

## Convenciones de código

- **TypeScript estricto**: `strict: true` en `tsconfig.json`. No uses `any` salvo justificación explícita en comentario.
- **Server Actions vs Route Handlers**: usa Server Actions para mutaciones simples desde formularios; usa Route Handlers para endpoints que consumen APIs externas o requieren control de headers y autenticación explícita.
- **Cliente Supabase**: usa el cliente de servidor (`createServerClient`) en todo código que corra en el servidor. Nunca uses el cliente de browser para operaciones que requieran privilegios elevados o acceso a datos clínicos.
- **Errores**: todo error inesperado debe ser capturado por Sentry. No silencies errores con `catch (() => {})`.
- **Variables de entorno**: las variables sensibles van en `.env.local` (desarrollo) y en Railway (producción). Nunca hardcodees llaves en el código.
- **Migraciones**: cada migración incluye la política RLS de las tablas que crea. Una tabla sin política RLS no debe llegar a producción.

---

## Fuera del alcance del MVP

Ver lista completa en `docs/mvp-scope.md` sección "Fuera del alcance del MVP". Ejemplos críticos que no debes implementar:

- Acceso del Paciente al expediente clínico completo o a notas clínicas
- Transcripción automática de sesiones
- Diagnóstico autónomo por IA
- Chat clínico en tiempo real entre Profesional y Paciente
- Interacción directa del Paciente con GPT
- Firma electrónica avanzada en notas clínicas
- Exportación masiva de expedientes o notas
- Facturapi, Mercado Pago, SMS/WhatsApp automatizados
- Reserva de citas por el Paciente (self-booking)
- Modelos terapéuticos distintos a General y TCC
- Configuración granular de permisos por organización
- Panel financiero o gestión contable
