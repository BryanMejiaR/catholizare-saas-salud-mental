# NOTAS-004 — Notas Clínicas

## Propósito

Permitir al Profesional registrar, consultar, confirmar, corregir y exportar notas clínicas vinculadas al expediente clínico de cada Paciente.

Las notas clínicas forman parte del expediente clínico. NOTAS-004 no crea un expediente paralelo, sino que funciona como submódulo operativo para registrar las sesiones, intervenciones, evolución, referencias, interconsultas y egresos de manera práctica y frecuente.

La separación de NOTAS-004 como módulo independiente responde a una razón operativa: el Profesional utiliza las notas todos los días, especialmente después de cada sesión, por lo que el sistema debe permitir crearlas rápidamente desde la agenda, desde el expediente o desde un formulario de búsqueda de Paciente.

Toda nota clínica debe quedar vinculada obligatoriamente a:

- Paciente;
- expediente clínico;
- Profesional;
- cita, si aplica;
- proceso terapéutico, si aplica;
- organización, si aplica.

No debe existir una nota clínica suelta, sin Paciente ni expediente asociado.

---

## Relación con EXPEDIENTE-003

EXPEDIENTE-003 es el contenedor clínico maestro.

NOTAS-004 es un submódulo operativo del expediente.

```text
EXPEDIENTE-003
  ├── Datos de identificación
  ├── Consentimiento informado
  ├── Historia clínica
  ├── NOTAS-004
  │     ├── nota de admisión
  │     ├── nota de evolución
  │     ├── nota de interconsulta
  │     ├── nota de referencia / traslado
  │     ├── nota de egreso
  │     └── nota de corrección / addendum
  ├── Evaluaciones psicológicas
  ├── Procesos terapéuticos
  ├── Conceptualizaciones
  └── Documentos adjuntos
