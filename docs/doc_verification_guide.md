# Guía de Verificación de Specs

Checklist que debe completarse antes de dar por lista una spec para implementación. Aplica a cualquier módulo del MVP. Si algún punto de las secciones obligatorias no se cumple, la spec no está lista para implementar.

Todo agente de IA que reciba una tarea de implementación debe ejecutar esta verificación primero y reportar cualquier punto incumplido antes de escribir código.

---

## Cómo usar esta guía

1. Abre la spec del módulo que vas a verificar (en `specs/mvp/`).
2. Recorre cada sección de este documento y marca los puntos.
3. Si algún punto de las secciones **Obligatorias** falla: detén el trabajo, documenta el punto faltante y notifica al responsable del producto.
4. Los puntos de las secciones **Recomendadas** no bloquean, pero deben registrarse como deuda técnica si no se cumplen.
5. Adjunta el resultado de la verificación al inicio de cualquier tarea de implementación que lo requiera.

---

## Sección 1 — Estructura mínima (Obligatoria)

Toda spec del MVP debe contener estas secciones. Si alguna falta, la spec está incompleta.

- [ ] **Propósito**: qué problema resuelve el módulo en una o dos oraciones.
- [ ] **Actores**: tabla de roles y su tipo de interacción con el módulo.
- [ ] **Funcionalidades**: al menos una función (F-01) con descripción detallada.
- [ ] **Reglas de negocio**: lista numerada de invariantes del dominio.
- [ ] **Datos que maneja**: tabla de campos con nombre y descripción.
- [ ] **Dependencias**: lista de módulos de los que depende para operar.
- [ ] **Fuera de alcance del MVP**: lista explícita de lo que no implementa este módulo.

---

## Sección 2 — Completitud funcional (Obligatoria)

Para cada función (F-XX) declarada en la spec:

- [ ] La función tiene un nombre claro y un objetivo verificable.
- [ ] Si la función modifica datos, describe qué campos se crean o actualizan.
- [ ] Si la función tiene restricciones de acceso por rol, las lista explícitamente.
- [ ] Si la función puede fallar de forma controlada (validación, estado inválido), describe el comportamiento esperado.
- [ ] Toda función que modifique, consulte o exporte datos clínicos o sensibles indica que el evento debe quedar en auditoría.
- [ ] Las funciones que generan contenido con IA tienen definido el flujo borrador → revisión → aprobación → guardado.

---

## Sección 3 — Seguridad y RLS (Obligatoria)

- [ ] Cada tabla mencionada en "Datos que maneja" puede mapearse a una política RLS clara: quién puede leer, quién puede escribir.
- [ ] Ninguna tabla clínica es accesible para los roles `administrador` o `super_administrador` sin restricción explícita.
- [ ] Si el módulo incluye Storage (imágenes, PDFs), se define si el bucket es privado y si las URLs requieren firma.
- [ ] Si hay imágenes clínicas de evaluación (EVAL-014), se confirma la política TTL de 24 horas.
- [ ] Las API keys de servicios externos (OpenAI, Zoom, Resend, Stripe) no aparecen en código de cliente en ningún flujo descrito.

---

## Sección 4 — Protección de datos clínicos (Obligatoria para módulos clínicos)

Aplica a: EXPEDIENTE-003, NOTAS-004, PROCESO-GENERAL-005, PROCESO-TCC-006, EVAL-014, GPT-007.

- [ ] El módulo no expone notas clínicas, diagnósticos, hipótesis, conceptualizaciones ni resultados de evaluaciones a roles no clínicos.
- [ ] El Paciente no accede a contenido clínico completo (solo resumen terapéutico publicado, cuando aplique).
- [ ] Los datos de identificación directa del Paciente no se incluyen en paquetes enviados a IA, salvo justificación explícita.
- [ ] Ningún flujo guarda contenido generado por IA sin acción explícita del Profesional.
- [ ] Las operaciones de borrado son lógicas (campo `status`); no existen eliminaciones físicas en operación ordinaria.

---

## Sección 5 — Cumplimiento de IA clínica (Obligatoria si el módulo usa GPT-007)

Aplica a: EXPEDIENTE-003 (F-09), NOTAS-004, PROCESO-GENERAL-005, PROCESO-TCC-006, EVAL-014, GPT-007.

- [ ] El paquete clínico enviado a GPT-007 está definido: qué campos específicos se incluyen, no "todo el expediente".
- [ ] El resultado de GPT-007 se etiqueta como borrador en la interfaz.
- [ ] Existe un paso explícito de revisión y aprobación por el Profesional antes de guardar.
- [ ] El Paciente nunca ve borradores generados por IA.
- [ ] Las directrices del Profesional para guiar a GPT-007 (D-02.5) están soportadas en el flujo.
- [ ] El módulo registra en auditoría qué función de IA se usó, qué datos se enviaron (resumen) y si el resultado fue aprobado o descartado.

---

## Sección 6 — Auditoría (Obligatoria)

- [ ] La spec lista las acciones sensibles que deben registrarse en `audit_logs`.
- [ ] Cada acción auditada tiene definidos los campos mínimos: usuario, rol, acción, entidad, resultado.
- [ ] El inicio de sesión, cierre de sesión, intentos fallidos y cambios de contraseña están cubiertos en AUTH-001.
- [ ] Las consultas a contenido clínico protegido generan log de auditoría (no solo las escrituras).
- [ ] El uso de IA genera log de auditoría con identificación del tipo de función y resultado.

---

## Sección 7 — Cumplimiento normativo (Obligatoria para módulos clínicos)

Aplica a: EXPEDIENTE-003, NOTAS-004, PROCESO-GENERAL-005, PROCESO-TCC-006, EVAL-014.

- [ ] La spec referencia NOM-004-SSA3-2012 en los contextos aplicables (expediente, notas, conservación).
- [ ] La spec referencia NOM-024-SSA3-2012 en los contextos aplicables (trazabilidad, seguridad de sistemas de salud).
- [ ] Si el módulo maneja datos sensibles de acuerdo a la LFPDPPP (salud, creencias, vida sexual), lo señala.
- [ ] La política de retención mínima de 5 años para expedientes clínicos está soportada en la lógica de estados.
- [ ] El consentimiento informado es prerequisito para funciones clínicas, salvo excepciones justificadas definidas.

---

## Sección 8 — Modelo de datos (Obligatoria)

- [ ] Todos los campos listados en "Datos que maneja" tienen nombre, y es posible inferir su tipo de dato.
- [ ] Los campos de estado (status) tienen los valores posibles enumerados.
- [ ] Las relaciones con otras tablas están indicadas (FK implícita o explícita).
- [ ] No hay campos que contradigan las restricciones de `docs/data-model-overview.md`.
- [ ] Los campos de auditoría mínimos están incluidos: `created_at`, `updated_at`, y el identificador del usuario responsable.

---

## Sección 9 — Dependencias (Obligatoria)

- [ ] Todas las dependencias listadas existen en `docs/mvp-scope.md`.
- [ ] El módulo no depende de módulos fuera del alcance del MVP.
- [ ] Si una dependencia no está implementada, existe un mock o stub definido que permite avanzar.
- [ ] La tabla de dependencias en `docs/mvp-scope.md` refleja lo que la spec declara (sin contradicciones).

---

## Sección 10 — Interfaz de usuario (Recomendada)

No bloquea la implementación del backend, pero debe resolverse antes de que el frontend comience.

- [ ] La spec indica qué actor ve cada pantalla o sección principal.
- [ ] Los flujos con múltiples pasos (wizard, confirmación, aprobación) tienen los estados de UI descritos.
- [ ] Los mensajes de error y los estados vacíos están contemplados.
- [ ] La separación entre portal del Paciente y panel del Profesional es explícita cuando aplica.

---

## Sección 11 — Integraciones externas (Recomendada)

Aplica si el módulo usa Google Calendar, Zoom, Resend, Stripe u OpenAI.

- [ ] El módulo define qué operación de la API externa se usa (endpoint o acción concreta).
- [ ] El módulo define qué ocurre si la API externa falla o no está disponible.
- [ ] Las credenciales de la integración están identificadas como variables de entorno (no valores fijos en la spec).
- [ ] Google Calendar: se confirma que usa el scope ya autorizado en el primer login (D-09 / restricción 9 de mvp-scope.md).
- [ ] Zoom: el enlace de participante (`zoom_join_url`) y el enlace de anfitrión (`zoom_start_url`) se tratan como campos distintos con acceso diferenciado.

---

## Resultado de la verificación

Completa esta tabla al finalizar la revisión de una spec:

| Campo | Valor |
|---|---|
| Módulo verificado | — |
| Fecha de verificación | — |
| Verificado por | — |
| Secciones obligatorias aprobadas | X / 9 |
| Puntos fallidos (obligatorios) | — |
| Puntos pendientes (recomendados) | — |
| Decisión | `lista para implementar` / `requiere correcciones` |

---

## Referencia rápida — Secciones obligatorias por tipo de módulo

| Tipo de módulo | Secciones obligatorias adicionales |
|---|---|
| Módulo de autenticación (AUTH-001) | 1, 2, 3, 6 |
| Módulo de usuarios (USERS-002) | 1, 2, 3, 6, 8, 9 |
| Módulo clínico | 1, 2, 3, 4, 6, 7, 8, 9 |
| Módulo clínico con IA | 1, 2, 3, 4, 5, 6, 7, 8, 9 |
| Módulo de agenda / integraciones | 1, 2, 3, 6, 8, 9, 11 |
| Módulo administrativo (ADMIN-012) | 1, 2, 3, 6, 8, 9 |
| Módulo de soporte (HELP-018, PRO-013) | 1, 2, 3, 6, 9 |
