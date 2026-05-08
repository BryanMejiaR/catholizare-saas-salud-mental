# ADMIN-012 — Panel de Administración

## Propósito

Proveer a los roles Administrador y Super Administrador herramientas para gestionar usuarios, organizaciones, asignaciones administrativas, configuración institucional, reportes operativos y auditoría de la plataforma, sin acceso al contenido clínico de los expedientes.

El panel de administración no permite consultar notas clínicas, diagnósticos, hipótesis clínicas, formulaciones de caso, narrativas terapéuticas, resultados detallados de pruebas psicológicas ni contenido del proceso terapéutico.

---

## Actores

| Actor | Interacción |
|---|---|
| Administrador | Gestiona su organización: usuarios, asignaciones, configuración institucional y reportes operativos agregados. |
| Super Administrador | Gestiona todas las organizaciones, configuración global, usuarios administrativos, auditoría y estadísticas agregadas de la plataforma. |

---

## Funcionalidades del Administrador

### F-01 Gestión de usuarios de la organización

El Administrador puede:

- Ver listado de Profesionales y Pacientes de su organización.
- Crear cuentas de Profesional y Paciente según USERS-002.
- Editar datos básicos de usuarios de su organización:
  - nombre;
  - correo;
  - teléfono, si aplica;
  - estado de cuenta;
  - rol dentro de la organización.
- Activar y desactivar cuentas.
- Asignar o reasignar Pacientes entre Profesionales de la misma organización.

Restricciones:

- El Administrador no puede ver contenido clínico del expediente.
- La reasignación de pacientes debe quedar registrada en el log de auditoría.
- La reasignación no debe otorgar acceso automático a contenido clínico histórico sin regla explícita de acceso.
- Toda reasignación debe definir:
  - Profesional anterior;
  - Profesional nuevo;
  - Paciente reasignado;
  - Fecha y hora;
  - Usuario que ejecutó la acción;
  - Motivo administrativo de la reasignación.

---

### F-02 Reportes operativos de actividad

El Administrador puede ver reportes de uso de la plataforma dentro de su organización.

Métricas permitidas en MVP:

- Número de pacientes activos.
- Número de pacientes inactivos.
- Número de profesionales activos.
- Número de citas realizadas en un periodo.
- Número de expedientes activos.
- Número de expedientes archivados.
- Número de pacientes asignados por profesional.
- Número de citas por profesional.
- Uso agregado de módulos:
  - agenda;
  - expediente;
  - portal del paciente;
  - recursos enviados;
  - evaluaciones aplicadas, solo como conteo.

Restricciones:

- Los reportes no incluyen contenido clínico.
- No se muestran diagnósticos.
- No se muestran notas clínicas.
- No se muestran motivos de consulta individualizados.
- No se muestran resultados detallados de pruebas psicológicas.
- No se muestran datos que permitan identificar directa o indirectamente la situación clínica de un paciente.

---

### F-03 Configuración de la organización

El Administrador puede configurar:

- Nombre de la organización.
- Datos de contacto institucionales.
- Correos institucionales de notificación.
- Configuración básica de notificaciones por correo.
- Estado general de la organización.
- Preferencias administrativas visibles para los usuarios de esa organización.

Restricciones:

- La configuración de la organización no puede modificar reglas clínicas, documentos del expediente ni obligaciones normativas del sistema.
- La configuración no puede desactivar logs de auditoría.
- La configuración no puede permitir acceso administrativo a contenido clínico.

---

## Funcionalidades del Super Administrador

### F-04 Gestión de organizaciones

El Super Administrador puede:

- Ver listado de todas las organizaciones registradas en Catholizare.
- Crear nuevas organizaciones.
- Activar o desactivar organizaciones.
- Ver el estado general de cada organización:
  - activa;
  - inactiva;
  - suspendida;
  - número de usuarios;
  - número de profesionales;
  - número de pacientes;
  - fecha de creación;
  - fecha de última actividad.

Regla especial:

- Desactivar una organización bloquea el acceso ordinario de sus usuarios, pero no elimina datos ni expedientes.

---

### F-05 Gestión de Administradores y Super Administradores

El Super Administrador puede:

- Crear cuentas de Administrador asignadas a una organización.
- Desactivar cuentas de Administrador.
- Modificar organización asignada a un Administrador.
- Consultar el estado de cuentas administrativas.

La creación de cuentas de Super Administrador queda restringida a una cuenta raíz o propietario autorizado del sistema.

Restricciones:

- Toda creación, desactivación o modificación de cuentas administrativas debe registrarse en auditoría.
- Las cuentas de Super Administrador deben contar con autenticación reforzada.
- Ningún Administrador o Super Administrador puede usar su rol para acceder a contenido clínico del expediente.

---

### F-06 Gestión de contenido de Catholizare Pro

El Super Administrador puede:

- Administrar recursos terapéuticos disponibles en Catholizare Pro según PRO-013.
- Crear, editar, publicar, desactivar o archivar recursos.
- Crear, editar y desactivar anuncios visibles para Profesionales.
- Gestionar categorías, etiquetas y visibilidad de recursos.

Restricciones:

- El contenido de Catholizare Pro es formativo, psicoeducativo o institucional.
- Este módulo no permite acceder a expedientes clínicos.
- Los anuncios no deben utilizar información clínica identificable de pacientes.

---

### F-07 Acceso a logs de auditoría

El Super Administrador puede consultar el log de auditoría de la plataforma.

El log debe permitir filtrar por:

- Usuario.
- Rol.
- Organización.
- Acción.
- Fecha y hora.
- Módulo afectado.
- Entidad afectada.
- Resultado de la acción.
- Dirección IP o identificador de sesión, cuando esté disponible.

Los logs son de solo lectura.

No pueden ser editados, eliminados ni alterados desde el panel de administración.

Eventos mínimos que deben registrarse:

- Inicio de sesión.
- Intento fallido de inicio de sesión.
- Creación de usuario.
- Edición de usuario.
- Activación o desactivación de usuario.
- Creación de organización.
- Activación o desactivación de organización.
- Asignación o reasignación de pacientes.
- Consulta de reportes.
- Consulta de logs.
- Cambios de configuración institucional.
- Cambios de roles o permisos.
- Acciones realizadas por Super Administradores.

Regla especial:

- Las acciones del propio Super Administrador también quedan registradas.

---

### F-08 Estadísticas globales de la plataforma

El Super Administrador puede visualizar estadísticas globales y agregadas de la plataforma, sin acceso a contenido clínico individual ni datos que permitan identificar directa o indirectamente a pacientes.

Métricas permitidas en MVP:

- Número total de organizaciones activas.
- Número total de organizaciones inactivas.
- Número total de profesionales activos.
- Número total de pacientes activos.
- Número total de citas realizadas por periodo.
- Número total de expedientes activos.
- Número total de expedientes archivados.
- Uso agregado de módulos:
  - agenda;
  - expedientes;
  - portal de paciente;
  - recursos;
  - evaluaciones;
  - reportes administrativos.

Métricas permitidas con restricciones:

- Estadística agregada de motivos de consulta.
- Duración promedio o mediana de tratamientos.
- Profesionales con mayor volumen operativo de pacientes registrados.

Estas métricas solo podrán mostrarse bajo reglas de anonimización, agregación y mínimos de muestra.

Restricciones:

- No se muestran datos clínicos individuales.
- No se muestran diagnósticos por paciente.
- No se muestran motivos de consulta asociados a pacientes identificables.
- No se muestran notas clínicas.
- No se muestran narrativas terapéuticas.
- No se muestran resultados individuales de pruebas.
- No se muestran rankings clínicos de desempeño profesional.
- No se muestran estadísticas clínicas cuando el grupo analizado sea demasiado pequeño y permita inferir información de una persona concreta.

---

## F-09 Analítica clínica agregada y protegida

El sistema podrá generar analítica clínica agregada para fines de dirección, mejora del servicio, planeación institucional y evaluación operativa, siempre que no permita identificar directa o indirectamente a pacientes.

### F-09.1 Estadística de motivos de consulta

El sistema puede mostrar motivos de consulta únicamente como categorías agregadas.

Ejemplos de categorías permitidas:

- Ansiedad.
- Depresión.
- Duelo.
- Crisis de pareja.
- Problemas familiares.
- Adicción a la pornografía.
- Estrés laboral.
- Acompañamiento vocacional.
- Crisis espiritual asociada a sufrimiento emocional.
- Autoestima.
- Regulación emocional.
- Otro.

Reglas:

- El motivo de consulta debe registrarse mediante catálogo controlado.
- No debe mostrarse el texto libre escrito por el paciente en reportes administrativos.
- No debe mostrarse el motivo de consulta junto con nombre, correo, teléfono ni identificador del paciente.
- No debe mostrarse por profesional si el número de pacientes del grupo es bajo.
- No debe mostrarse por organización si el número de pacientes del grupo es bajo.
- Para MVP, se recomienda mostrarlo solo en forma global o por organización con umbral mínimo.

Umbral mínimo recomendado:

- Mostrar una categoría solo si existen al menos 10 pacientes en ese grupo.
- Si hay menos de 10 pacientes, agrupar como “Otros” o no mostrar.

Ejemplo permitido:

| Motivo de consulta | Pacientes | Porcentaje |
|---|---:|---:|
| Ansiedad | 245 | 32% |
| Duelo | 118 | 15% |
| Problemas de pareja | 97 | 13% |
| Otros | 302 | 40% |

Ejemplo no permitido:

| Paciente | Profesional | Motivo |
|---|---|---|
| María G. | Psicólogo A | Depresión |

---

### F-09.2 Duración de los tratamientos

El sistema puede calcular duración de tratamientos como métrica agregada.

Definición recomendada:

Duración del tratamiento = tiempo transcurrido entre la primera sesión registrada y el cierre, alta, abandono administrativo o última sesión registrada del proceso.

Métricas permitidas:

- Duración promedio de tratamiento.
- Mediana de duración.
- Distribución por rangos:
  - 1 sesión;
  - 2 a 4 sesiones;
  - 5 a 8 sesiones;
  - 9 a 12 sesiones;
  - más de 12 sesiones.
- Número promedio de sesiones por proceso.
- Tasa de procesos activos, cerrados o abandonados administrativamente.

Restricciones:

- No mostrar duración asociada a nombre de paciente.
- No mostrar duración con motivo de consulta si el grupo es pequeño.
- No mostrar duración por profesional si puede inferirse información clínica de pacientes concretos.
- No usar esta métrica para evaluar calidad clínica del profesional sin contexto clínico, supervisión y criterios éticos.

Ejemplo permitido:

| Rango de duración | Procesos | Porcentaje |
|---|---:|---:|
| 1 sesión | 80 | 12% |
| 2 a 4 sesiones | 210 | 31% |
| 5 a 8 sesiones | 170 | 25% |
| 9 a 12 sesiones | 90 | 13% |
| Más de 12 sesiones | 130 | 19% |

Ejemplo no permitido:

| Paciente | Motivo | Duración | Profesional |
|---|---|---:|---|
| Juan P. | Adicción a pornografía | 14 sesiones | Psicólogo B |

---

### F-09.3 Profesionales con mayor volumen operativo

Esta métrica puede existir, pero debe formularse como métrica operativa, no como ranking clínico.

Nombre recomendado:

Profesionales con mayor volumen operativo de pacientes registrados.

Métricas permitidas:

- Número de pacientes asignados.
- Número de pacientes activos.
- Número de pacientes nuevos en el periodo.
- Número de citas realizadas.
- Número de expedientes activos.
- Número de expedientes archivados.
- Tasa de asistencia a citas.
- Tasa de cancelaciones o no asistencia.

Restricciones:

- No debe interpretarse como “mejor profesional”.
- No debe mezclarse con diagnósticos, motivos de consulta o notas clínicas.
- No debe mostrar información individual de pacientes.
- No debe generar incentivos contrarios a la calidad clínica, dignidad del paciente o prudencia terapéutica.

Ejemplo permitido:

| Profesional | Pacientes activos | Citas realizadas | Expedientes activos |
|---|---:|---:|---:|
| Profesional A | 32 | 84 | 32 |
| Profesional B | 28 | 76 | 28 |
| Profesional C | 21 | 58 | 21 |

Ejemplo no permitido:

| Profesional | Pacientes con depresión | Pacientes con adicción | Duración por paciente |
|---|---:|---:|---:|

---

## Reglas de negocio

1. El Administrador y el Super Administrador no tienen acceso al contenido clínico de los expedientes.

2. Se considera contenido clínico:
   - notas clínicas;
   - diagnósticos;
   - hipótesis clínicas;
   - formulación de caso;
   - motivo de consulta en texto libre;
   - resultados detallados de pruebas;
   - narrativas del paciente;
   - evolución terapéutica;
   - observaciones clínicas del profesional.

3. El Administrador puede ver datos administrativos mínimos:
   - usuario activo o inactivo;
   - profesional asignado;
   - expediente activo o archivado;
   - número de citas;
   - estado administrativo del proceso.

4. El Super Administrador puede ver logs de auditoría, pero toda consulta queda registrada.

5. No existe eliminación física de datos desde el panel administrativo. Las operaciones ordinarias son de activación, desactivación, archivado o bloqueo lógico.

6. Cualquier cancelación, supresión, bloqueo especial o tratamiento legal de datos personales deberá realizarse conforme al aviso de privacidad, políticas internas y normatividad aplicable.

7. El Super Administrador es el único rol ordinario que puede crear cuentas de Administrador.

8. La creación de cuentas de Super Administrador queda restringida a una cuenta raíz o propietario autorizado.

9. El panel de administración es una interfaz separada del panel del Profesional y del portal del Paciente.

10. Los servicios de IA no podrán recibir datos de identificación directa del paciente ni contenido clínico identificable, salvo que exista un caso de uso explícitamente autorizado, protegido y conforme a las políticas de privacidad.

11. Toda acción administrativa sensible debe registrarse en auditoría.

12. El sistema debe operar bajo principio de mínimo privilegio.

13. Las estadísticas clínicas agregadas solo podrán mostrarse si cumplen reglas de anonimización, agregación y umbral mínimo de muestra.

---

## Datos que maneja

El panel de administración opera sobre datos de:

- USERS-002 — usuarios.
- EXPEDIENTE-003 — estado administrativo del expediente, no contenido clínico.
- AGENDA-008 — agenda y citas.
- PRO-013 — contenido de Catholizare Pro.
- LOG-014 — auditoría.
- ANALYTICS-017 — métricas agregadas y anonimizadas.

El módulo ADMIN-012 no almacena contenido clínico.

Sí administra:

- configuración organizacional;
- estados administrativos;
- asignaciones;
- roles;
- activación y desactivación de cuentas;
- eventos de auditoría;
- reportes agregados;
- métricas operativas.

---

## Dependencias

- USERS-002 — gestión de usuarios.
- EXPEDIENTE-003 — expediente clínico, solo estados administrativos.
- AGENDA-008 — agenda y citas.
- PRO-013 — contenido de Catholizare Pro.
- LOG-014 — auditoría.
- PRIV-015 — privacidad, anonimización y tratamiento de datos.
- AI-016 — reglas de uso de inteligencia artificial, si aplica.
- ANALYTICS-017 — analítica agregada.

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
