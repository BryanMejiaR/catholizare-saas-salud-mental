# EXPEDIENTE-003 — Expediente Clínico

## Propósito

Gestionar el expediente clínico digital de cada paciente conforme a la NOM-004-SSA3-2012. El expediente es el contenedor central que agrupa los datos de identificación del paciente, el consentimiento informado, las notas clínicas y los procesos terapéuticos.

---

## Actores

| Actor | Interacción |
|---|---|
| Profesional | Crea, consulta y gestiona el expediente de sus pacientes |
| Paciente | Ve el resumen que el profesional decide publicar (solo lectura) |
| Administrador | No accede al contenido clínico; solo ve estado del expediente |

---

## Funcionalidades

### F-01 Inicialización del expediente
- Al crear un Paciente (ver USERS-002), se crea automáticamente un expediente clínico vacío asociado.
- El Profesional completa los datos de identificación antes de registrar cualquier nota clínica.
- El expediente no puede usarse para registrar notas hasta que los datos de identificación estén completos y el consentimiento informado exista.

### F-02 Datos de identificación del paciente
Campos obligatorios según NOM-004-SSA3-2012:
- Nombre completo
- Sexo
- Fecha de nacimiento
- Domicilio (calle, número, colonia, municipio, estado, CP)
- Teléfono de contacto
- Nombre y teléfono del responsable o familiar (para menores de edad o casos de emergencia)
- Número de seguridad social (opcional si el paciente no lo tiene)
- Motivo de consulta inicial

### F-03 Consentimiento informado
- El expediente debe registrar que el consentimiento informado fue obtenido antes del inicio del tratamiento.
- Campos a registrar: fecha de firma, nombre del profesional que lo obtuvo, y referencia al documento físico o digital.
- El sistema puede almacenar el documento digitalizado (PDF/imagen) o registrar únicamente la confirmación de que fue firmado en físico.
- Sin consentimiento informado registrado, el sistema alerta al Profesional pero no bloquea el flujo en el MVP.

### F-04 Consultar expediente
- El Profesional accede al expediente completo de sus pacientes desde el panel principal.
- Vista del expediente: datos de identificación, estado del consentimiento, listado de notas clínicas, listado de procesos terapéuticos, historial de citas.
- Navegación rápida entre secciones del expediente.

### F-05 Archivar expediente
- El Profesional puede archivar un expediente cuando el proceso terapéutico ha concluido y ya no está activo.
- El archivado es lógico: el expediente sigue existiendo y es consultable, pero no aparece en la lista activa.
- No se permite eliminar expedientes (NOM-004-SSA3-2012: conservación mínima de 5 años).

### F-06 Publicar resumen para el paciente
- El Profesional puede seleccionar qué información del expediente es visible en el portal del paciente.
- El resumen es un campo de texto libre que el Profesional redacta y publica conscientemente; no es una copia automática del expediente.
- El Profesional puede actualizar el resumen en cualquier momento.

---

## Reglas de negocio

1. Un expediente pertenece a exactamente un Paciente y está asociado al Profesional que lo creó.
2. Los expedientes no se eliminan nunca; solo se archivan.
3. La política de retención es de mínimo 5 años desde la última consulta registrada, o hasta 3 años después de que el paciente alcance la mayoría de edad (NOM-004-SSA3-2012).
4. El contenido del expediente (notas, datos clínicos) no es accesible para el Administrador ni para el Super Administrador en operación normal. El acceso del Super Administrador en soporte técnico queda registrado en el log de auditoría.
5. El GPT (ver GPT-007) no tiene acceso a los datos de identificación del paciente. Solo interactúa con los campos del proceso terapéutico.
6. Toda lectura y modificación del expediente genera una entrada en el log de auditoría.

---

## Datos que maneja

| Campo | Descripción |
|---|---|
| `expediente_id` | Identificador único del expediente |
| `patient_id` | Paciente al que pertenece (relación 1:1) |
| `professional_id` | Profesional propietario del expediente |
| `identification_data` | Datos de identificación completos (ver F-02) |
| `consent_status` | `pendiente`, `firmado_fisico`, `firmado_digital` |
| `consent_date` | Fecha de firma del consentimiento |
| `consent_obtained_by` | Nombre del profesional que obtuvo el consentimiento |
| `patient_summary` | Resumen publicado para el portal del paciente |
| `status` | `activo`, `archivado` |
| `created_at` | Fecha de creación |
| `last_activity_at` | Fecha de la última consulta o modificación |

---

## Requisitos normativos

- **NOM-004-SSA3-2012**: define los campos de identificación obligatorios (F-02), el consentimiento informado (F-03) y la conservación mínima de 5 años (F-05).
- **NOM-024-SSA3-2012**: toda acción sobre el expediente (lectura, creación, modificación) se registra en el log de auditoría. El acceso está restringido por rol y organización.

---

## Dependencias

- USERS-002 — el expediente se crea al dar de alta al Paciente.
- NOTAS-004 — las notas clínicas viven dentro del expediente.
- PROCESO-GENERAL-005 y PROCESO-TCC-006 — los procesos terapéuticos están vinculados al expediente.
- AGENDA-008 — el historial de citas se muestra en el expediente.
- PORTAL-011 — el resumen publicado (F-06) alimenta el portal del paciente.
- Log de auditoría — registra toda actividad sobre el expediente.

---

## Fuera de alcance del MVP

- Firma digital del consentimiento informado dentro de la plataforma
- Compartir el expediente completo con otro profesional (solo referencia/traslado via nota)
- Exportación masiva de expedientes
- Estadísticas clínicas agregadas sobre el expediente
