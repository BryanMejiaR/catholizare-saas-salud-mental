# Alcance del MVP

Define qué está dentro y fuera del MVP de Catholizare, las dependencias entre módulos y los criterios que deben cumplirse antes del lanzamiento. Todo agente de IA debe leer este archivo antes de proponer implementaciones para no construir fuera del alcance acordado.

Stack tecnológico de referencia: ver **D-09** en `docs/decisions-log.md`.

---

## Módulos incluidos en el MVP

| Código | Nombre | Spec | Descripción |
|---|---|---|---|
| AUTH-001 | Autenticación | `specs/mvp/AUTH-001-autenticacion.md` | Registro, login, recuperación de contraseña, sesiones y activación por invitación. |
| USERS-002 | Gestión de Usuarios | `specs/mvp/USERS-002-gestion-usuarios.md` | Creación, edición, activación y desactivación de los cuatro roles del sistema. |
| EXPEDIENTE-003 | Expediente Clínico | `specs/mvp/EXPEDIENTE-003-expediente-clinico.md` | Contenedor clínico maestro: identificación, consentimiento, historia clínica, resumen terapéutico compartido y conceptualización. |
| NOTAS-004 | Notas Clínicas | `specs/mvp/NOTAS-004-notas-clinicas.md` | Registro, confirmación, corrección y exportación a PDF de notas clínicas vinculadas al expediente. |
| PROCESO-GENERAL-005 | Proceso Terapéutico — Modelo General | `specs/mvp/PROCESO-GENERAL-005-proceso-terapeutico-modelo-general.md` | Flujo terapéutico configurable por el Profesional; base para enfoques no especificados. |
| PROCESO-TCC-006 | Proceso Terapéutico — Modelo TCC | `specs/mvp/PROCESO-TCC-006-proceso-terapeutico-tcc.md` | Flujo clínico estructurado de Terapia Cognitivo-Conductual con conceptualización, plan, ruta por sesiones, estado de ánimo y cortes de reevaluación. |
| GPT-007 | Asistente Clínico GPT | `specs/mvp/GPT-007-asistente-clinico.md` | Asistente de IA para prellenado, conceptualización, plan de tratamiento, planeación de sesiones, resumen terapéutico y análisis de evaluaciones. Opera solo con paquete clínico controlado. |
| AGENDA-008 | Agenda y Citas | `specs/mvp/AGENDA-008-agenda-citas.md` | Gestión de citas del Profesional con sincronización a Google Calendar y generación de enlace Zoom. |
| GCAL-009 | Integración Google Calendar | `specs/mvp/GCAL-009-integracion-google-calendar.md` | Sincronización bidireccional entre la agenda de Catholizare y Google Calendar del Profesional. |
| ZOOM-010 | Integración Zoom | `specs/mvp/ZOOM-010-integracion-zoom.md` | Generación automática de enlaces de reunión Zoom para citas de videollamada. |
| PORTAL-011 | Portal del Paciente | `specs/mvp/PORTAL-011-portal-paciente.md` | Interfaz separada del Paciente: resumen terapéutico compartido, citas, enlace Zoom y solicitudes. |
| ADMIN-012 | Panel de Administración | `specs/mvp/ADMIN-012-panel-administracion.md` | Gestión de usuarios, reportes operativos agregados, configuración institucional y auditoría. Sin acceso a contenido clínico. |
| PRO-013 | Catholizare Pro | `specs/mvp/PRO-013-catholizare-pro.md` | Recursos, banners y anuncios exclusivos para el Profesional; gestionados por Super Administrador. |
| EVAL-014 | Evaluaciones Psicológicas | `specs/mvp/EVAL-014-evaluaciones-psicologicas.md` | Registro, carga de imágenes, análisis asistido por IA, validación de resultados y vinculación al expediente. |
| HELP-018 | Centro de Ayuda | `specs/mvp/HELP-018-centro-ayuda.md` | Guías operativas, FAQ y canal de soporte humano vía WhatsApp. Estrictamente no clínico. |

---

## Módulos transversales (sin spec propia, integrados en cada módulo)

Los siguientes módulos no tienen spec independiente porque su lógica está distribuida en todos los módulos del sistema.

| Referencia | Descripción |
|---|---|
| LOG (auditoría) | Registro de auditoría obligatorio en toda acción sensible. Definido en las secciones de Auditoría de cada spec. Implementado mediante triggers o middleware centralizado sobre Supabase. |
| PRIV (privacidad) | Principio de mínimo necesario, consentimiento informado y control de acceso clínico. Definido en las reglas de negocio de cada spec y en `docs/normative-compliance.md`. Implementado mediante RLS en Supabase desde la primera tabla. |

---

## Dependencias entre módulos

La tabla indica de qué módulos depende cada uno para funcionar. No se debe implementar un módulo sin que sus dependencias estén en estado funcional o mockeado.

| Módulo | Depende de |
|---|---|
| AUTH-001 | — |
| USERS-002 | AUTH-001 |
| EXPEDIENTE-003 | AUTH-001, USERS-002, GPT-007 |
| NOTAS-004 | EXPEDIENTE-003, USERS-002, AGENDA-008, PROCESO-GENERAL-005, PROCESO-TCC-006, EVAL-014, GPT-007 |
| PROCESO-GENERAL-005 | EXPEDIENTE-003, NOTAS-004, GPT-007, AGENDA-008, EVAL-014 |
| PROCESO-TCC-006 | EXPEDIENTE-003, NOTAS-004, EVAL-014, GPT-007, AGENDA-008, ZOOM-010, PORTAL-011 |
| GPT-007 | EXPEDIENTE-003, NOTAS-004, EVAL-014, PROCESO-GENERAL-005, PROCESO-TCC-006, AGENDA-008, PORTAL-011 |
| AGENDA-008 | USERS-002, EXPEDIENTE-003, NOTAS-004, PROCESO-GENERAL-005, PROCESO-TCC-006, GCAL-009, ZOOM-010, PORTAL-011 |
| GCAL-009 | AGENDA-008, AUTH-001 (Google OAuth con scope Calendar) |
| ZOOM-010 | AGENDA-008 |
| PORTAL-011 | AUTH-001, USERS-002, EXPEDIENTE-003, AGENDA-008, ZOOM-010, GPT-007 |
| ADMIN-012 | USERS-002, EXPEDIENTE-003, AGENDA-008, PRO-013, EVAL-014 |
| PRO-013 | USERS-002, ADMIN-012 |
| EVAL-014 | EXPEDIENTE-003, NOTAS-004, GPT-007, PROCESO-GENERAL-005, PROCESO-TCC-006 |
| HELP-018 | USERS-002 |

---

## Orden de implementación recomendado

Basado en las dependencias, el orden mínimo para tener el núcleo funcional es:

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

Cada bloque puede desarrollarse en paralelo dentro de sus fronteras; los bloques deben respetarse en orden.

---

## Fuera del alcance del MVP

Todo lo que aparece en esta lista no debe implementarse ni diseñarse hasta una fase posterior. Si un agente de IA propone algo de esta lista, debe descartarse.

### Clínico
- Acceso del Paciente al expediente clínico completo o a notas clínicas.
- Modelos terapéuticos adicionales (solo General y TCC en MVP).
- Aplicación directa de pruebas psicológicas desde el sistema.
- Banco interno de instrumentos psicológicos, reactivos o manuales.
- Firma electrónica avanzada en notas clínicas.
- Exportación masiva de expedientes o notas.
- Transcripción automática de sesiones.
- Diagnóstico autónomo por IA.
- Chat clínico en tiempo real entre Profesional y Paciente.
- Interacción directa del Paciente con GPT.
- Supervisión clínica interna automática.

### Administrativo
- Configuración granular avanzada de permisos por rol.
- Exportación de reportes a Excel o CSV.
- Panel financiero de ingresos, churn o facturación.
- Gestión contable.
- Rankings clínicos de Profesionales.
- Acceso administrativo a contenido clínico.

### Integraciones y pagos
- Facturapi (Fase 2).
- Mercado Pago (opción futura).
- Integración con plataformas psicométricas licenciadas externas.
- Integración con proveedores de videollamada distintos a Zoom.
- Recordatorios automáticos por SMS o WhatsApp.
- Reserva de citas por el Paciente (self-booking).

### Portal del Paciente
- Edición de datos personales por el Paciente.
- Visualización de resultados completos de evaluaciones psicológicas.
- Reprogramación automática de citas sin aprobación del Profesional.
- Transferencia automática del expediente completo en referidos.
- Recursos de Catholizare Pro visibles para el Paciente.

---

## Restricciones transversales del MVP

Las siguientes reglas aplican a todos los módulos sin excepción. Todo agente de IA debe respetarlas al proponer diseño, migraciones o código.

1. **RLS obligatorio**: toda tabla en Supabase tiene Row Level Security activo antes de su primera migración a producción. Ninguna tabla puede existir en producción sin política RLS explícita.

2. **Contenido clínico protegido**: notas clínicas, diagnósticos, hipótesis, conceptualizaciones, resultados de evaluaciones psicológicas, imágenes de pruebas e interpretaciones psicométricas nunca son accesibles para los roles Administrador y Super Administrador en operación normal.

3. **Borradores de IA nunca se auto-guardan**: todo contenido generado por GPT-007 es borrador hasta que el Profesional lo aprueba y guarda explícitamente. Ningún flujo puede guardar contenido de IA sin acción humana.

4. **Paquete clínico controlado**: GPT-007 solo recibe los datos estrictamente necesarios para la tarea solicitada. Nunca accede libremente al expediente completo. Nunca recibe datos de identificación directa del Paciente salvo que sean estrictamente necesarios.

5. **TTL de imágenes clínicas**: las imágenes cargadas en EVAL-014 para análisis con IA se eliminan del bucket de Supabase Storage a las 24 horas mediante Supabase Edge Function + pg_cron. El resultado clínico validado se conserva en base de datos; la imagen original no.

6. **Auditoría obligatoria**: toda acción sensible (creación, edición, confirmación, consulta, exportación, uso de IA, inicio de sesión, acceso al portal) queda registrada con usuario, rol, fecha, hora y resultado de la acción.

7. **Sin eliminación física**: expedientes, notas clínicas, citas y evaluaciones no se eliminan físicamente desde operación ordinaria. Las operaciones son lógicas (estado `anulado`, `archivado` o `inactivo`).

8. **Portal separado**: el portal del Paciente y el panel del Profesional son interfaces completamente separadas. No existe acceso cruzado entre roles.

9. **Google OAuth unificado**: el scope de Google Calendar (`https://www.googleapis.com/auth/calendar`) se solicita en el mismo flujo OAuth del primer login para no requerir una segunda autorización al activar GCAL-009.

10. **Cumplimiento normativo**: toda funcionalidad que maneje expedientes clínicos debe ser compatible con NOM-004-SSA3-2012 y NOM-024-SSA3-2012. Ver `docs/normative-compliance.md`.

---

## Criterios de lanzamiento del MVP

El MVP se considera listo para lanzamiento cuando todos los puntos siguientes están cumplidos:

### Funcionalidad
- [ ] Los 15 módulos listados en este documento están implementados y probados.
- [ ] El flujo completo Profesional → Expediente → Proceso TCC → Notas → Portal Paciente funciona de extremo a extremo.
- [ ] GPT-007 genera borradores en los 8 contextos definidos en su spec y no guarda contenido sin aprobación del Profesional.
- [ ] Google Calendar sincroniza citas en ambas direcciones.
- [ ] Zoom genera y entrega el enlace de participante al Paciente dentro de la ventana de 24 horas.
- [ ] Las notas confirmadas se exportan a PDF correctamente.
- [ ] El panel de administración muestra reportes operativos agregados sin exponer contenido clínico.

### Seguridad y privacidad
- [ ] RLS activo y probado en todas las tablas de Supabase.
- [ ] Ningún rol puede acceder a datos fuera de su alcance definido en `docs/actors-and-roles.md`.
- [ ] Las imágenes de evaluaciones se eliminan automáticamente después de 24 horas.
- [ ] Los logs de auditoría registran todas las acciones sensibles listadas en cada spec.
- [ ] Sentry configurado y capturando errores en producción.
- [ ] Las API keys de OpenAI, Supabase, Zoom, Resend y Stripe nunca se exponen al cliente.

### Normativa
- [ ] Consentimiento informado implementado conforme a EXPEDIENTE-003 y NOM-004-SSA3-2012.
- [ ] Los expedientes cumplen los campos mínimos requeridos por NOM-004-SSA3-2012.
- [ ] El aviso de privacidad está disponible y vinculado en los flujos de registro.

### Operación
- [ ] Railway desplegado con variables de entorno correctas.
- [ ] Supabase Cloud configurado con backups automáticos habilitados.
- [ ] Resend configurado con dominio verificado para correos transaccionales.
- [ ] Stripe configurado con productos y precios del plan Care y Pro.
