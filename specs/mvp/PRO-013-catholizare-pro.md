# PRO-013 — Catholizare Pro

## Propósito

Mostrar recursos terapéuticos y anuncios de Catholizare Pro exclusivamente en el panel del Profesional, como banners en diversas secciones del sistema. El objetivo es que el Profesional conozca y acceda a los beneficios de Catholizare Pro desde su flujo de trabajo habitual.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Ve los recursos y anuncios de Pro en su panel |
| Super Administrador | Gestiona el contenido de Pro (recursos y anuncios) |
| Paciente | Sin acceso; el contenido Pro no es visible en el portal del paciente |
| Administrador | Sin acceso al contenido Pro |

---

## Funcionalidades

### F-01 Mostrar banners de Catholizare Pro en el panel del Profesional
- Los banners aparecen en secciones estratégicas del panel del Profesional (por ejemplo: panel principal, pantalla de proceso terapéutico, agenda).
- Los banners pueden ser: recursos terapéuticos disponibles, nuevas funciones Pro, anuncios del equipo de Catholizare.
- El Profesional puede cerrar o ignorar un banner; el sistema recuerda cuáles ya fueron vistos.

### F-02 Ver recursos terapéuticos de Pro
- El Profesional accede a una sección de recursos dentro de su panel.
- Los recursos son materiales de apoyo para la práctica clínica (fichas, guías, herramientas terapéuticas).
- En el MVP, el acceso al recurso puede dirigir al Profesional a una URL externa o mostrar el recurso dentro de la plataforma.

### F-03 Gestionar contenido Pro (Super Administrador)
- El Super Administrador crea, edita y desactiva recursos y anuncios desde el panel de administración (ver ADMIN-012 F-06).
- Campos de un recurso: título, descripción, tipo (archivo, enlace externo), contenido o URL, secciones donde se muestra.
- Campos de un anuncio: título, cuerpo, fecha de inicio, fecha de fin, imagen (opcional).

### F-04 Control de visibilidad
- El contenido Pro solo se muestra a usuarios con rol Profesional.
- Los banners desactivados o expirados no se muestran.
- El Paciente no ve ningún contenido de Catholizare Pro en ninguna circunstancia.

---

## Reglas de negocio

1. Catholizare Pro es un módulo de visibilidad y marketing interno; **no es un módulo de suscripción** en el MVP. Todos los Profesionales ven el contenido Pro.
2. El contenido Pro es exclusivo del panel del Profesional; no aparece en el portal del Paciente ni en el panel de Administración.
3. Los recursos y anuncios son gestionados únicamente por el Super Administrador.
4. Los banners no interrumpen los flujos clínicos críticos (no son modales bloqueantes en flujos de notas o procesos).

---

## Datos que maneja

### Recurso
| Campo | Descripción |
|---|---|
| `resource_id` | Identificador único del recurso |
| `title` | Título del recurso |
| `description` | Descripción breve |
| `type` | `archivo`, `enlace_externo` |
| `content_url` | URL del archivo o del enlace externo |
| `target_sections` | Secciones del panel donde aparece |
| `status` | `activo`, `inactivo` |
| `created_by` | Super Administrador que lo creó |
| `created_at` | Fecha de creación |

### Anuncio
| Campo | Descripción |
|---|---|
| `announcement_id` | Identificador único del anuncio |
| `title` | Título del anuncio |
| `body` | Contenido del anuncio |
| `image_url` | URL de imagen opcional |
| `starts_at` | Fecha de inicio de visibilidad |
| `ends_at` | Fecha de fin de visibilidad |
| `status` | `activo`, `inactivo` |

### Interacción del Profesional con el banner
| Campo | Descripción |
|---|---|
| `professional_id` | Profesional que interactuó |
| `content_id` | Recurso o anuncio |
| `dismissed_at` | Fecha en que lo cerró o ignoró |

---

## Dependencias

- ADMIN-012 — el Super Administrador gestiona el contenido Pro desde ahí.
- USERS-002 — el sistema filtra la visibilidad por rol Profesional.

---

## Fuera de alcance del MVP

- Modelo de suscripción o pago para acceder a Catholizare Pro
- Contenido Pro personalizado por organización o por Profesional
- Analítica de consumo de recursos (qué recursos son más vistos)
- Notificaciones push para nuevos recursos Pro
