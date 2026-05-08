# ADMIN-012 — Panel de Administración

## Propósito

Proveer a los roles Administrador y Super Administrador las herramientas para gestionar usuarios, organizaciones y la configuración de la plataforma, sin acceso al contenido clínico de los expedientes.

---

## Actores

| Actor | Interacción |
|---|---|
| Administrador | Gestiona su organización: usuarios, asignaciones, reportes |
| Super Administrador | Gestiona todas las organizaciones y la plataforma completa |

---

## Funcionalidades del Administrador

### F-01 Gestión de usuarios de la organización
- Ver listado de todos los Profesionales y Pacientes de la organización.
- Crear cuentas de Profesional y Paciente (ver USERS-002).
- Editar datos básicos (nombre, correo) de usuarios de la organización.
- Activar y desactivar cuentas.
- Asignar o reasignar Pacientes entre Profesionales de la organización.

### F-02 Ver reportes de actividad
- El Administrador puede ver reportes de uso de la plataforma para su organización:
  - Número de pacientes activos
  - Número de citas realizadas en un periodo
  - Número de expedientes activos y archivados
  - Número de profesionales activos
- Los reportes **no incluyen contenido clínico**: no se muestran diagnósticos, notas ni datos del proceso terapéutico.

### F-03 Configuración de la organización
- Nombre de la organización
- Datos de contacto institucionales
- Configuración de notificaciones por correo

---

## Funcionalidades del Super Administrador

### F-04 Gestión de organizaciones
- Ver listado de todas las organizaciones registradas en Catholizare.
- Crear nuevas organizaciones.
- Desactivar organizaciones (bloquea el acceso de todos sus usuarios).
- Ver el estado general de cada organización (activa/inactiva, número de usuarios).

### F-05 Gestión de Administradores y Super Administradores
- Crear cuentas de Administrador asignadas a una organización.
- Crear cuentas de Super Administrador.
- Desactivar cuentas de Administrador y Super Administrador.

### F-06 Gestión de contenido de Catholizare Pro
- Administrar recursos terapéuticos disponibles en Catholizare Pro (ver PRO-013).
- Crear, editar y desactivar anuncios visibles para los Profesionales.

### F-07 Acceso a logs de auditoría
- Ver el log de auditoría de toda la plataforma (ver requisito NOM-024-SSA3-2012).
- Filtrar por: usuario, acción, fecha/hora, organización.
- Los logs son de solo lectura; no son editables ni eliminables.

### F-08 Estadísticas globales de la plataforma
- Número total de organizaciones, profesionales y pacientes activos.
- Uso agregado de módulos (expedientes, citas, etc.) sin datos clínicos.

---

## Reglas de negocio

1. El Administrador y el Super Administrador **no tienen acceso** al contenido clínico de los expedientes (notas, procesos terapéuticos, diagnósticos).
2. El Super Administrador puede ver los logs de auditoría, pero su propio acceso a datos queda registrado en el log.
3. No existe eliminación de datos; todas las operaciones son de activación/desactivación lógica.
4. El Super Administrador es el único que puede crear cuentas de Administrador y Super Administrador.
5. El panel de administración es una interfaz separada del panel del Profesional y del portal del Paciente.

---

## Datos que maneja

El panel de administración opera sobre los datos de USERS-002 (usuarios), EXPEDIENTE-003 (estado del expediente, no su contenido), AGENDA-008 (conteo de citas, no detalles clínicos) y el log de auditoría.

No genera ni almacena datos propios más allá de los de configuración de la organización.

---

## Dependencias

- USERS-002 — gestión de usuarios.
- PRO-013 — gestión de contenido de Catholizare Pro (solo Super Administrador).
- Log de auditoría — visible para el Super Administrador.

---

## Fuera de alcance del MVP

- Configuración de permisos granulares por organización
- Exportación de reportes a Excel o CSV
- Panel de métricas de negocio (ingresos, churn, etc.)
- Gestión de facturación o suscripciones
