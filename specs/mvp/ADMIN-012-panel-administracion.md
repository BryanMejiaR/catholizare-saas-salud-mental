# ADMIN-012 — Panel de Administración

## Propósito

Proveer a los roles Administrador y Super Administrador herramientas para gestionar usuarios, organizaciones, asignaciones administrativas, configuración institucional, reportes operativos y auditoría de la plataforma, sin acceso al contenido clínico de los expedientes.

El panel de administración no permite consultar notas clínicas, diagnósticos, hipótesis clínicas, formulaciones de caso, narrativas terapéuticas, resultados detallados de pruebas psicológicas, imágenes de evaluaciones ni contenido del proceso terapéutico.

---

## Actores

| Actor | Interacción |
|---|---|
| Administrador | Gestiona su organización: usuarios, asignaciones, configuración institucional y reportes operativos agregados. |
| Super Administrador | Gestiona todas las organizaciones, configuración global, usuarios administrativos, auditoría y estadísticas agregadas de la plataforma. |

---

## Funcionalidades del Administrador

### F-01 Gestión de usuarios de la organización

El Administrador puede ver, crear, editar datos básicos, activar, desactivar y asignar usuarios de su organización según permisos.

Restricciones:

- No puede ver contenido clínico del expediente.
- Toda reasignación debe quedar registrada en auditoría.

---

### F-02 Reportes operativos de actividad

El Administrador puede ver reportes de uso de la plataforma dentro de su organización.

Métricas permitidas en MVP:

- número de pacientes activos e inactivos;
- número de profesionales activos;
- número de citas realizadas;
- número de expedientes activos y archivados;
- número de pacientes asignados por profesional;
- número de citas por profesional;
- uso agregado de agenda, expediente, portal, recursos y evaluaciones solo como conteo.

Restricciones:

- No se muestran diagnósticos.
- No se muestran notas clínicas.
- No se muestran motivos de consulta individualizados.
- No se muestran resultados de pruebas psicológicas.
- No se muestran imágenes, inventarios o protocolos.

---

### F-03 Configuración de la organización

El Administrador puede configurar nombre de organización, datos institucionales, correos de notificación, estado general y preferencias administrativas.

Restricciones:

- No puede modificar obligaciones normativas del sistema.
- No puede desactivar logs.
- No puede permitir acceso administrativo a contenido clínico.

---

## Funcionalidades del Super Administrador

### F-04 Gestión de organizaciones

Puede ver, crear, activar, desactivar y consultar estado general de organizaciones.

---

### F-05 Gestión de Administradores y Super Administradores

Puede crear cuentas de Administrador, desactivar cuentas administrativas y consultar estado de cuentas administrativas. La creación de Super Administradores queda restringida a cuenta raíz o propietario autorizado.

---

### F-06 Gestión de contenido de Catholizare Pro

Puede administrar recursos, banners, eventos, recordatorios y anuncios de Catholizare Pro según PRO-013, sin acceder a datos clínicos.

---

### F-07 Acceso a logs de auditoría

El Super Administrador puede consultar logs de auditoría filtrando por usuario, rol, organización, acción, fecha, módulo, entidad afectada, resultado e identificador de sesión si aplica.

Los logs son de solo lectura.

---

### F-08 Estadísticas globales de la plataforma

El Super Administrador puede visualizar estadísticas globales y agregadas sin acceso a contenido clínico individual ni datos que permitan identificar pacientes.

Métricas permitidas:

- organizaciones activas e inactivas;
- profesionales activos;
- pacientes activos;
- citas por periodo;
- expedientes activos y archivados;
- uso agregado de módulos;
- conteos administrativos de evaluaciones psicológicas, sin resultados, imágenes ni contenido clínico.

Métricas permitidas con restricciones:

- motivos de consulta agregados;
- duración promedio o mediana de tratamientos;
- profesionales con mayor volumen operativo de pacientes registrados.

Restricciones:

- No se muestran datos clínicos individuales.
- No se muestran diagnósticos por paciente.
- No se muestran notas clínicas.
- No se muestran resultados individuales de pruebas.
- No se muestran imágenes de evaluaciones.
- No se muestran rankings clínicos de desempeño profesional.

---

## F-09 Analítica clínica agregada y protegida

El sistema podrá generar analítica clínica agregada para fines de dirección, mejora del servicio y planeación institucional, siempre que no permita identificar directa o indirectamente a pacientes.

Reglas:

- Mostrar categorías solo con umbral mínimo recomendado de 10 pacientes.
- Agrupar categorías pequeñas como "Otros" o no mostrarlas.
- No cruzar variables que permitan reidentificación.

---

## Reglas de negocio

1. El Administrador y el Super Administrador no tienen acceso al contenido clínico de los expedientes.
2. Se considera contenido clínico: notas, diagnósticos, hipótesis, formulación, texto libre de motivo de consulta, resultados de pruebas, imágenes de evaluaciones, narrativas, evolución y observaciones clínicas.
3. El Administrador puede ver estados administrativos mínimos.
4. Toda consulta de logs queda registrada.
5. No existe eliminación física de datos desde el panel administrativo; las operaciones ordinarias son lógicas.
6. El Super Administrador es el único rol ordinario que puede crear cuentas de Administrador.
7. La creación de Super Administradores queda restringida a cuenta raíz o propietario autorizado.
8. El panel de administración es una interfaz separada del panel Profesional y portal del Paciente.
9. Los servicios de IA no podrán recibir datos de identificación directa ni contenido clínico identificable salvo caso explícito autorizado conforme a privacidad.
10. Toda acción administrativa sensible debe registrarse en auditoría.
11. El sistema debe operar bajo principio de mínimo privilegio.
12. Las estadísticas clínicas agregadas solo podrán mostrarse si cumplen anonimización, agregación y umbral mínimo.
13. Administradores y Super Administradores no tienen acceso al contenido clínico de evaluaciones psicológicas, imágenes de pruebas, inventarios, protocolos ni interpretaciones psicométricas individuales.

---

## Datos que maneja

El panel de administración opera sobre datos de:

- USERS-002 — usuarios.
- EXPEDIENTE-003 — estado administrativo del expediente, no contenido clínico.
- AGENDA-008 — conteo de citas y estados administrativos.
- PRO-013 — contenido de Catholizare Pro.
- EVAL-014 — solo conteos administrativos o estados agregados de evaluaciones, nunca contenido clínico, imágenes ni resultados individuales.

El módulo ADMIN-012 no almacena contenido clínico.

---

## Dependencias

- USERS-002 — gestión de usuarios.
- EXPEDIENTE-003 — expediente clínico, solo estados administrativos.
- AGENDA-008 — agenda y citas.
- PRO-013 — contenido de Catholizare Pro.
- EVAL-014 — conteos agregados y estados no clínicos de evaluaciones.
- GPT-007 — reglas de uso de inteligencia artificial clínica asistida.

---

## Fuera de alcance del MVP

- Configuración granular avanzada de permisos por organización.
- Exportación de reportes a Excel o CSV.
- Panel financiero de ingresos, churn, suscripciones o facturación.
- Gestión contable.
- Evaluación de desempeño clínico de profesionales.
- Rankings clínicos de profesionales.
- Consulta de contenido clínico desde el panel administrativo.
- Visualización individual de motivos de consulta.
- Visualización individual de duración de tratamiento.
- Cruces clínicos avanzados por diagnóstico, profesional y paciente.
- Acceso administrativo a resultados completos de evaluaciones psicológicas.
- Acceso administrativo a imágenes de pruebas, inventarios o protocolos.
