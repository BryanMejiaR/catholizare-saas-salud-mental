# Catholizare SaaS — Salud Mental

Plataforma SaaS de salud mental para profesionales y pacientes. Gestión de expedientes clínicos, procesos terapéuticos, agenda, portal de paciente, recursos terapéuticos y asistente clínico con IA, con cumplimiento de NOM-004-2012 y NOM-024-2012.

---

## Qué es Catholizare

Catholizare es una plataforma diseñada para psicólogos que integra:

- Expediente clínico digital (NOM-004-2012)
- Procesos terapéuticos configurables por enfoque (general y TCC)
- Agenda sincronizada con Google Calendar
- Portal del paciente con acceso a su resumen y citas
- Videollamadas vía Zoom
- Recursos terapéuticos de Catholizare Pro
- Asistente clínico con GPT para apoyo en el proceso terapéutico

---

## Estructura del repositorio

```
catholizare-saas-salud-mental/
│
├── README.md                        # Este archivo
│
├── ai-specs/                        # Fuente canonical de skills y agentes IA
│   └── skills/
│       ├── enrich-user-story/       # Skill para cerrar requisitos vagos en specs accionables
│       └── write-pr-report/         # Skill para generar descripciones de PR limpias
│
├── docs/                            # Documentación base del producto (contexto para agentes)
│   ├── doc_ai_planning_mode.md      # Reglas del proceso SDD para agentes de IA
│   ├── vision.md                    # Propósito, problema y propuesta de valor
│   ├── actors-and-roles.md          # Roles, permisos y reglas de acceso
│   ├── domain-glossary.md           # Términos clínicos y de negocio
│   ├── normative-compliance.md      # Requisitos NOM-004-2012 y NOM-024-2012
│   ├── decisions-log.md             # Registro de decisiones de producto cerradas
│   └── mvp-scope.md                 # Alcance formal del MVP
│
├── specs/                           # Especificaciones funcionales por módulo
│   ├── mvp/                         # Specs del MVP (13 módulos)
│   └── future/                      # Specs de fases posteriores
│
└── tasks/                           # Task briefs generados por el proceso SDD
```

> Los archivos marcados en `docs/` que aún no existen se crean durante la Fase 2 del plan SDD.

---

## Cómo trabajar en este repositorio

Este proyecto usa **Spec-Driven Development (SDD)**. El proceso está documentado en [`docs/doc_ai_planning_mode.md`](docs/doc_ai_planning_mode.md).

### Flujo general

```
1. Leer docs base → 2. Escribir spec → 3. Generar task brief → 4. Implementar → 5. Verificar
```

### Antes de cualquier tarea

Todo agente o desarrollador debe leer primero:

1. [`docs/vision.md`](docs/vision.md) — qué es el producto y para quién.
2. [`docs/actors-and-roles.md`](docs/actors-and-roles.md) — quién puede hacer qué.
3. [`docs/domain-glossary.md`](docs/domain-glossary.md) — qué significa cada término.

Si la tarea involucra expedientes clínicos, documentos legales o datos de salud:

4. [`docs/normative-compliance.md`](docs/normative-compliance.md) — requisitos NOM obligatorios.

### Para escribir una nueva spec

Usar el skill [`ai-specs/skills/enrich-user-story/`](ai-specs/skills/enrich-user-story/SKILL.md) para cerrar decisiones abiertas antes de redactar.

### Para generar un PR

Usar el skill [`ai-specs/skills/write-pr-report/`](ai-specs/skills/write-pr-report/SKILL.md).

### Ubicación del trabajo activo

Los task briefs generados durante el proceso SDD se escriben bajo `tasks/`.

---

## Estado actual del proyecto

| Fase | Descripción | Estado |
|---|---|---|
| Fase 1 | Limpieza y estructura del repo | En progreso |
| Fase 2 | Documentación base en `/docs` | Pendiente |
| Fase 3 | Specs MVP en `/specs` | Pendiente |
| Fase 4 | Definición formal del MVP | Pendiente |
| Fase 5 | Preparación para agente implementador | Pendiente |

---

## Restricciones importantes

- No asumir stack tecnológico hasta que esté definido en `docs/`.
- No asumir detalles clínicos que no estén en `docs/normative-compliance.md` o `docs/domain-glossary.md`.
- No crear archivos bajo `tasks/` sin un High-Level Technical Contract aprobado.
- Todo cambio en general y en especial que afecte expedientes clínicos debe verificar cumplimiento con la NOM-004-SSA3-2012 y la NOM-024-SSA3-2012 en lo correspondiente al sistema de expediente
