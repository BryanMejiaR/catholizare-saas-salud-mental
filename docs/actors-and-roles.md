# Actores y Roles

Catholizare define exactamente cuatro roles de usuario (ver D-08 en `docs/decisions-log.md`). Cada rol tiene un conjunto acotado de permisos. No existen roles personalizados ni intermedios en el MVP.

---

## Resumen de roles

| Rol | Actor | Nivel de acceso |
|---|---|---|
| Paciente | Usuario que recibe atención | Solo lectura de su propio resumen y citas |
| Profesional | Psicólogo/terapeuta | Gestión clínica completa de sus pacientes |
| Administrador | Gestión de cuenta institucional | Configuración de cuenta, usuarios y profesioanes, ademas de reportes |
| Super Administrador | Equipo interno de Catholizare | Acceso completo al sistema, alta de administrador, alta de super administrador, acceso a estadisticas, acceso modificacion de perfiles de pacientes y de administradores |

---

## Paciente

### Quién es
Persona que recibe atención psicológica de un profesional registrado en Catholizare. Su cuenta es creada por el profesional o el administrador; no puede registrarse de forma autónoma en el MVP.

### Acceso
- Portal del paciente (interfaz separada del panel del profesional)
- Solo lectura; no puede modificar ningún dato clínico

### Puede hacer
- Ver su resumen clínico (lo que el profesional decida publicar)
- Ver sus citas programadas
- Acceder al enlace de videollamada (Zoom) de su cita
- Enviar mesaje a Terapeuta para pedir cancelacion o reprogramacion de citas
- Acceder a cotnenido completo deacuerdo a su motivo de consulta
- Evaluar al profesional
- Aceptar que su caso actual sea referido a otro profesional


### No puede hacer
- Ver el expediente clínico completo ni las notas del profesional
- Ver información de otros pacientes
- Modificar ningún dato de su expediente
- Acceder a recursos de Catholizare Pro
- Interactuar con el asistente GPT

---

## Profesional

### Quién es
Psicólogo, psicoterapeuta o profesional de salud mental que usa Catholizare para gestionar su práctica clínica.

### Acceso
- Panel principal de Catholizare
- Acceso completo a sus propios pacientes y sus expedientes
- No tiene acceso a pacientes de otros profesionales salvo que se le asigne explícitamente con autorizacion del paciente y del administrador

### Puede hacer
- Crear y gestionar expedientes clínicos de sus pacientes
- Registrar notas clínicas (notas de evolución, interconsulta, egreso, etc.)
- Crear y gestionar procesos terapéuticos (modelo General o TCC)
- Editar la estructura del modelo terapéutico general
- Consultar y usar el asistente GPT para pre-llenar campos del proceso terapéutico
- Validar y modificar sugerencias del asistente GPT antes de guardarlas
- Gestionar su agenda y sincronizarla con Google Calendar
- Crear citas con enlace Zoom
- Definir qué información del expediente es visible para el paciente en el portal
- Acceder a recursos terapéuticos de Catholizare Pro
- Ver materiales y anuncios de Catholizare Pro
- Ver el calendario de reuniones clinicas y calendario de fe

### No puede hacer
- Acceder a expedientes de pacientes de otros profesionales (sin asignación explícita)
- Modificar configuración de cuenta de otros profesionales
- Gestionar usuarios del sistema
- Acceder al panel de administración

---

## Administrador

### Quién es
Rol de plataforma dentro de Catholizare, con permisos reducidos respecto al Super Administrador. No pertenece a ningún Profesional ni institución. Gestiona usuarios y configuración a nivel global de la plataforma (ver D-12 en `docs/decisions-log.md`).

### Acceso
- Panel de administración de la plataforma
- Vista de usuarios y configuración general

### Puede hacer
- Crear, editar y desactivar cuentas de Profesionales y Pacientes en la plataforma
- Ver reportes de uso y actividad agregados de toda la plataforma (sin contenido clínico sensible)
- Asignar Pacientes a Profesionales

### No puede hacer
- Ver el contenido de los expedientes clínicos (el contenido clínico es privado entre profesional y paciente)
- Acceder a notas clínicas ni a procesos terapéuticos
- Acceder al panel de Super Administrador
- Crear cuentas de Administrador o Super Administrador

---

## Super Administrador

### Quién es
Miembro del equipo interno de Catholizare. Este rol no se asigna a clientes.

### Acceso
- Acceso completo al sistema y a todos los módulos

### Puede hacer
- Todo lo que pueden hacer los demás roles
- Gestionar cuentas institucionales y su configuración
- Administrar contenido de Catholizare Pro (recursos y anuncios)
- Acceder a logs de auditoría del sistema
- Configurar parámetros globales de la plataforma
- Dar de alta a administradores y otro super administrador

### Restricciones
- Las acciones sobre expedientes clínicos de pacientes deben quedar registradas en el log de auditoría (requerimiento NOM-024-SSA3-2012)
- El acceso a contenido clínico en contexto de soporte técnico debe seguir el protocolo definido en `docs/normative-compliance.md`
- No puede tenedr acceso al contenido de los expedientes clinicos 

---

## Reglas de acceso transversales

1. **Aislamiento de datos por profesional**: cada Profesional solo accede a sus propios Pacientes y expedientes. No existe aislamiento por organización (ver D-12).
2. **Sin acceso cruzado entre Profesionales**: un Profesional no accede a los expedientes de otro Profesional sobre el mismo Paciente, salvo asignación explícita con autorización del Paciente y del Administrador.
3. **El paciente solo ve lo que el profesional publica**: el portal del paciente muestra únicamente lo que el profesional ha marcado como visible.
4. **Los recursos Pro son exclusivos del profesional**: ningún paciente ni administrador ve contenido de Catholizare Pro.
5. **Toda acción sobre datos clínicos queda en log de auditoría**: requerimiento de la NOM-024-SSA3-2012.
6. **El asistente GPT no guarda datos**: sugerencias de GPT no se persisten hasta que el profesional las valida y guarda.
