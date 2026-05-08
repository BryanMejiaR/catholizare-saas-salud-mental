# Cumplimiento Normativo

Este archivo mapea los requisitos de la **NOM-004-SSA3-2012** y la **NOM-024-SSA3-2012** a las decisiones de diseño y módulos de Catholizare. Es la referencia obligatoria para cualquier tarea que involucre expedientes clínicos, datos de salud o seguridad de la información.

Los documentos oficiales de ambas normas están disponibles en `docs/normas/`:
- `docs/normas/NOM-004-SSA3-2012.pdf`
- `docs/normas/NOM-024-SSA3-2012.pdf`

**Regla de oro**: si existe conflicto entre una decisión de diseño y un requisito de la NOM-004-SSA3-2012 o la NOM-024-SSA3-2012, la norma prevalece siempre.

---

## NOM-004-SSA3-2012 — Del Expediente Clínico

### Alcance en Catholizare

La NOM-004-SSA3-2012 aplica al módulo de **Expediente Clínico** y a cualquier otro módulo que genere, consulte o modifique datos clínicos del paciente (notas, procesos terapéuticos, consentimientos).

### Requisitos mapeados al sistema

#### Identificación del paciente
- Cada expediente debe contener datos de identificación completos del paciente: nombre completo, sexo, fecha de nacimiento, domicilio, y en su caso, número de seguridad social.
- **En Catholizare**: el formulario de alta de paciente debe incluir todos los campos de identificación exigidos por la norma como campos obligatorios, no opcionales.

#### Tipos de notas clínicas obligatorias
La norma define las notas que deben existir en un expediente. Catholizare debe soportar:

| Nota | Momento | Obligatoria |
|---|---|---|
| Nota de admisión | Al iniciar la relación terapéutica | Sí |
| Nota de evolución | En cada consulta o sesión | Sí |
| Nota de interconsulta | Cuando se solicita o recibe consulta de otro profesional | Condicional |
| Nota de referencia/traslado | Al derivar al paciente | Condicional |
| Nota de egreso | Al cerrar el proceso terapéutico | Sí |

- **En Catholizare**: el módulo de expediente clínico debe permitir crear cada tipo de nota. Las notas obligatorias (admisión, evolución, egreso) deben tener flujos claros en la interfaz.

#### Consentimiento informado
- El expediente debe contener consentimiento informado firmado por el paciente antes del inicio del tratamiento. 
- **En Catholizare**: debe existir un documento de consentimiento informado asociado al expediente. El sistema debe registrar la fecha de firma y quién lo obtuvo.

#### Conservación del expediente
- Los expedientes clínicos deben conservarse por un mínimo de 5 años a partir de la última consulta, o hasta 3 años después de que el paciente alcance la mayoría de edad, lo que ocurra después.
- **En Catholizare**: no se permite la eliminación de expedientes clínicos. El "archivado" es lógico (ocultar del flujo activo) pero los datos se conservan. La política de retención debe cumplir el mínimo normativo.

#### Legibilidad e integridad
- Las notas deben ser legibles y no deben alterarse una vez firmadas (o guardadas con carácter definitivo).
- **En Catholizare**: las notas clínicas firmadas/confirmadas no son editables. Si se requiere corrección, se agrega una nota de corrección sin eliminar la original. Las sugerencias del asistente GPT no tienen carácter de nota hasta que el profesional las guarda explícitamente.

#### Acceso al expediente
- El expediente es confidencial. Solo el personal de salud autorizado y el propio paciente (en los términos que establezca el profesional) tienen acceso.
- **En Catholizare**: el control de acceso por rol (ver `docs/actors-and-roles.md`) implementa este requisito. Un profesional no accede a expedientes de pacientes de otros profesionales sin asignación explícita.

---

## NOM-024-SSA3-2012 — Sistemas de Información de Salud

### Alcance en Catholizare

La NOM-024-SSA3-2012 aplica a toda la plataforma Catholizare en cuanto a infraestructura, seguridad, manejo de datos y operación del sistema de información de salud.

### Requisitos mapeados al sistema

#### Confidencialidad
- La información clínica del paciente es confidencial y solo accesible a las personas autorizadas, GPT no tenda acceso a la informacion de identifiacion del paciente.
- **En Catholizare**: implementado mediante autenticación, control de acceso por rol y aislamiento de datos por organización y profesional (ver `docs/actors-and-roles.md`).

#### Integridad
- Los datos clínicos no deben ser alterados de forma no autorizada. Toda modificación debe ser trazable.
- **En Catholizare**: las notas clínicas no son editables una vez guardadas en estado definitivo. El log de auditoría registra todas las modificaciones.

#### Disponibilidad
- El sistema debe garantizar disponibilidad de la información para los usuarios autorizados cuando la necesiten.
- **En Catholizare**: definir niveles de disponibilidad (SLA) es parte de la decisión de infraestructura (pendiente en D-09). El diseño debe considerar respaldo automático y plan de recuperación.

#### Control de acceso y autenticación
- Solo usuarios autenticados y autorizados acceden al sistema. Las credenciales deben protegerse.
- **En Catholizare**: autenticación obligatoria para todos los roles. Las contraseñas no se almacenan en texto plano. Se debe evaluar autenticación multifactor para el rol Profesional.

#### Log de auditoría
- Toda acción sobre datos de salud debe quedar registrada: usuario, acción, fecha/hora, dato afectado.
- **En Catholizare**: el sistema genera logs de auditoría automáticos para:
  - Creación, lectura, modificación de notas clínicas
  - Acceso al expediente por cualquier usuario
  - Cambios en permisos de acceso
  - Acceso a datos clínicos por el rol Super Administrador
  - Exportación de expedientes

Los logs de auditoría no son editables ni eliminables por ningún rol.

#### Cifrado de datos
- La información de salud debe protegerse mediante cifrado, especialmente en tránsito y en reposo.
- **En Catholizare**: toda comunicación entre cliente y servidor usa TLS. Los datos de salud en base de datos deben cifrarse en reposo. El diseño de datos debe identificar qué campos son PII o datos de salud para aplicar cifrado diferenciado.

#### Respaldo de información
- Deben existir procedimientos de respaldo periódico de la información para garantizar recuperación ante fallas.
- **En Catholizare**: el proveedor de infraestructura (pendiente D-09) debe ofrecer respaldos automáticos con retención mínima de 30 días. El diseño de la base de datos debe facilitar respaldos consistentes.

#### Interoperabilidad
- Los sistemas de información de salud deben facilitar la interoperabilidad con otros sistemas cuando sea necesario.
- **En Catholizare**: en el MVP, la interoperabilidad se limita a Google Calendar y Zoom. Las notas de referencia/traslado deben poder exportarse en formato legible (PDF) para compartir con otros profesionales.

---

## Checklist de cumplimiento para specs y tareas

Antes de aprobar cualquier spec o task brief que toque expediente clínico o datos de salud, verificar:

- [ ] ¿Los campos de identificación del paciente cumplen NOM-004-SSA3-2012?
- [ ] ¿Los tipos de notas clínicas están correctamente implementados?
- [ ] ¿Existe consentimiento informado antes del inicio del proceso terapéutico?
- [ ] ¿Las notas guardadas son inmutables (no editables)?
- [ ] ¿La política de retención de datos es de mínimo 5 años?
- [ ] ¿El acceso está restringido por rol y organización?
- [ ] ¿Toda acción sobre datos clínicos genera entrada en el log de auditoría?
- [ ] ¿Los datos en tránsito usan TLS?
- [ ] ¿Los datos en reposo están cifrados?
- [ ] ¿Existe plan de respaldo y recuperación?

---

## Notas de implementación

- Los archivos PDF de las normas (`docs/normas/NOM-004-SSA3-2012.pdf` y `docs/normas/NOM-024-SSA3-2012.pdf`) son la fuente de verdad. En caso de ambigüedad, consultar directamente el texto oficial.
- Este archivo es un mapeo de alto nivel. Los requisitos detallados de cada módulo se especifican en las specs correspondientes bajo `specs/mvp/`.
- Cuando el stack tecnológico se defina (D-09), se deberá revisar este documento para agregar decisiones técnicas concretas de implementación.
