# Glosario de Dominio

Términos clínicos y de negocio usados en Catholizare. Todo agente o desarrollador debe usar estos términos con precisión. Si un término no está aquí, no se debe asumir su significado — se agrega al glosario antes de usarlo en una spec.

---

## Términos clínicos

### Expediente clínico
Conjunto de documentos escritos, gráficos, imagenológicos, electrónicos, magnéticos, electromagnéticos, ópticos, magneto-ópticos y de cualquier otra índole en los que el personal de salud deberá hacer los registros, anotaciones, en su caso, constancias y certificaciones correspondientes a su intervención en la atención médica del paciente. Definición alineada a la NOM-004-SSA3-2012.

En Catholizare, el expediente clínico es el módulo central que contiene toda la información clínica de un paciente asociado a un profesional.

### Nota clínica
Documento dentro del expediente clínico que registra una intervención, observación o acción del profesional de salud. Tipos reconocidos por la NOM-004-SSA3-2012:
- **Nota de admisión/ingreso**: registro inicial al comenzar la relación terapéutica
- **Nota de evolución**: registro del estado del paciente en cada consulta o sesión
- **Nota de interconsulta**: solicitud o resultado de consulta con otro profesional
- **Nota de referencia/traslado**: documentación para derivar al paciente a otro servicio
- **Nota de egreso**: cierre formal del proceso terapéutico

### Proceso terapéutico
Flujo estructurado de intervenciones clínicas que el profesional realiza con un paciente a lo largo del tiempo. En Catholizare existen dos modelos de proceso terapéutico (ver Modelo General y Modelo TCC).

### Modelo terapéutico
Plantilla que define la estructura, pasos y campos de un proceso terapéutico. Catholizare incluye dos modelos:
- **Modelo General**: configurable y editable por el profesional; aplicable a cualquier enfoque
- **Modelo TCC**: estructura específica para Terapia Cognitivo-Conductual

### Modelo General
Modelo terapéutico base de Catholizare. El profesional puede modificar sus pasos, campos y flujos. Los cambios aplican a procesos nuevos; los procesos en curso no se alteran retroactivamente.

### Modelo TCC (Terapia Cognitivo-Conductual)
Modelo terapéutico con estructura predefinida alineada a la metodología de Terapia Cognitivo-Conductual. No es libremente editable; su estructura refleja los pasos formales de la TCC.

### Sesión
Encuentro clínico entre el profesional y el paciente, ya sea presencial o por videollamada. Cada sesión genera al menos una nota de evolución en el expediente y puede tener una cita asociada en la agenda.

### Consentimiento informado
Documento legal y clínico mediante el cual el paciente acepta el tratamiento y autoriza el manejo de su información de salud. Su existencia en el expediente es requerida por la NOM-004-SSA3-2012.

### Resumen clínico del paciente
Versión simplificada del expediente clínico que el profesional decide exponer al paciente en su portal. No incluye notas completas del profesional salvo lo que él publique explícitamente.

---

## Términos del sistema

### Portal del paciente
Interfaz de Catholizare exclusiva para el rol Paciente. Muestra el resumen clínico y las citas programadas. Es de solo lectura y está separada del panel del profesional.

### Panel del profesional
Interfaz principal de Catholizare para el rol Profesional. Contiene el expediente clínico, la agenda, los procesos terapéuticos y el asistente GPT.

### Asistente clínico (GPT)
Módulo de inteligencia artificial dentro de Catholizare que pre-llena campos del proceso terapéutico usando GPT. El profesional revisa y valida toda sugerencia antes de que quede registrada. No actúa de forma autónoma.

### Catholizare Pro
Módulo de Catholizare que ofrece recursos terapéuticos y anuncios para profesionales. Es visible exclusivamente en el panel del profesional; el paciente no tiene acceso.

### Agenda
Módulo de gestión de citas dentro de Catholizare, sincronizado bidireccionalmente con Google Calendar del profesional. Permite crear citas con enlace de Zoom automático.

### Cita
Evento agendado entre el profesional y el paciente, con fecha, hora, duración y enlace de videollamada (Zoom). Aparece en la agenda de Catholizare y en Google Calendar.

### Log de auditoría
Registro automático de todas las acciones sobre datos clínicos: quién accedió, qué modificó, cuándo. Requerido por la NOM-024-SSA3-2012 para garantizar trazabilidad e integridad de la información.

---

## Acrónimos y siglas

| Sigla | Significado |
|---|---|
| TCC | Terapia Cognitivo-Conductual |
| NOM | Norma Oficial Mexicana |
| NOM-004-SSA3-2012 | Norma Oficial Mexicana del expediente clínico |
| NOM-024-SSA3-2012 | Norma Oficial Mexicana de sistemas de información de salud |
| SDD | Spec-Driven Development |
| GPT | Generative Pre-trained Transformer (modelo de lenguaje de OpenAI) |
| SaaS | Software as a Service |
| MVP | Minimum Viable Product |
