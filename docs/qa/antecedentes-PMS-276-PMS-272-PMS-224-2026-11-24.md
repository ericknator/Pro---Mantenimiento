# Antecedentes documentales de Jira — 24/11/2026

Copia de las descripciones antes de sintetizar las actualizaciones del asistente. Se conserva para trazabilidad; las referencias a estados o revisiones previas corresponden a sus respectivos momentos. El estado vigente se consulta en Jira. Este archivo no añade pruebas, decisiones ni aprobaciones.

## PMS-276

Fuente: https://gean-team-isil.atlassian.net/browse/PMS-276

Como administrador del condominio, quiero registrar propietarios e inquilinos con rol RESIDENTE y asignarlos a una unidad residencial, para que puedan acceder a Pro-Mantenimiento sin depender del equipo de desarrollo.

**Criterios de aceptación**

CA-01 — Alta autorizada      
Dado un administrador autenticado con perfil y rol activos, cuando registra nombres, apellidos, correo, unidad activa y tipo de ocupación válido, entonces el backend valida la solicitud, crea la cuenta mediante Firebase Admin SDK y registra el perfil en MySQL con rol RESIDENTE y la relación activa con la unidad indicada. La respuesta no expone contraseñas ni credenciales sensibles.

CA-02 — Correo duplicado      
Dado un correo ya registrado en Firebase o en el perfil local, cuando el administrador intenta registrarlo nuevamente, entonces la operación es rechazada con un mensaje comprensible y no se crea un segundo usuario ni una segunda relación.

CA-03 — Unidad no válida      
Dado un identificador de unidad inexistente o inactivo, cuando se intenta completar el alta, entonces la operación es rechazada antes de confirmar la asociación y no queda un perfil residente creado parcialmente.

CA-04 — Autorización por rol      
Dado un usuario autenticado que no tiene rol ADMINISTRADOR activo, cuando intenta invocar el alta desde la interfaz o directamente por API, entonces recibe una respuesta de acceso denegado y no se modifica Firebase ni MySQL.

CA-05 — Consistencia ante fallo      
Dado un error al persistir el perfil o la relación después de crear la identidad en Firebase, cuando el backend detecta la inconsistencia, entonces ejecuta la compensación o deja el proceso en un estado explícitamente recuperable sin registrar un alta exitosa falsa. El resultado debe quedar trazable en logs técnicos sin exponer datos sensibles.

CA-06 — Acceso del residente      
Dado un alta completada, cuando el nuevo residente utiliza el mecanismo de activación/autenticación configurado por el equipo, entonces puede iniciar sesión y el sistema reconoce el rol RESIDENTE y la unidad asociada para las operaciones permitidas.

---

## Consolidación de QA — 24/11/2026

**Versión observada:** clon oficial actualizado a `7df77f0a91cdde34b4b4c71b372615a66685be88`. Pruebas manuales ejecutadas por Erick en la aplicación habitual; análisis y consolidación asistidos por ChatGPT/Codex. Datos sintéticos de QA, no residentes ni incidencias reales del condominio.

| Criterio | Resultado observado | Evidencia adjunta |
| --- | --- | --- |
| CA-01, propietario | Alta 201 Created; cuenta RESIDENTE, T01–Dpto. 401, propietario. Contador de 9 a 10; persiste tras recargar. | 10293 y 10286 |
| CA-01, inquilino | Listado recargado con 11 usuarios activos; cuenta RESIDENTE, T01–Dpto. 201, inquilino. La captura muestra GET 200, no el POST de esta alta. | 10291 |
| CA-02, perfil duplicado | POST 409 y mensaje “Ya existe un perfil con ese correo.” Contador visible 10. | 10290 |
| CA-03, unidad inexistente 999999 | POST 404, código UNIDAD_NO_ENCONTRADA, mensaje de unidad inexistente o inactiva. Contador visible 11. | 10292 |
| CA-04, residente | Navegación administrativa redirigida a /inicio. POST directo al alta con autorización de residente y cuerpo {}: 403 Forbidden. | Rechazo API: 10285; redirección observada en la conversación |
| CA-05, fallos de persistencia/commit y compensación | AdminUsuarioServiceTest ejecutado por Erick con Maven: 5 pruebas, 0 fallos, 0 errores, 0 omitidas; BUILD SUCCESS. Son simulaciones mediante mocks. | Reporte Surefire contrastado; resumen y hash en el manifiesto del PR #60 |
| CA-06, propietario | Inicio de sesión y perfil 200, usuario 10 con rol RESIDENTE. La incidencia QA INC-2026-0004 se recupera con solicitante 10 y unidad 4, número 401, piso 4, torre T01. | 10287, 10288 y 10289 |

**Maven adicional:** AlertaInternaPropiedadTest: 3 aprobadas, 0 fallos/errores/omitidas, con las fuentes Java y POM contrastados con el clon oficial. Se ejecutó con Byte Buddy cargado al inicio de la JVM para resolver la limitación de auto-attach de este entorno. Es HTTP simulado y repositorios sustituidos, no una prueba nueva con cuentas reales en navegador. Las dos ejecuciones dirigidas suman 8 casos; no equivalen a todos los tests del proyecto.

**Alcance y límites:** no se simula una caída real de Firebase/MySQL. Se comprobó el alta del inquilino, no su inicio de sesión. No se atribuyen casos nuevos de unidad inactiva ni de duplicado existente exclusivamente en Firebase, consultas directas de persistencia tras los rechazos, ejecución de Karma, build de producción o despliegue externo.

**Fuentes:** nueve capturas originales adjuntas a esta HU; [registro detallado y matriz de evidencia](https://github.com/ericknator/Pro---Mantenimiento/blob/6fdfb62c702c96a00edaa42aafa2252c9ce51d18/docs/qa/PMS-276-validacion-2026-11-24.md); [PR #60 de documentación](https://github.com/ericknator/Pro---Mantenimiento/pull/60), con manifiesto de adjuntos, tamaños, hashes y reportes Maven sanitizados. El PR es documental y permanece abierto para revisión; no modifica la aplicación.

**Anexo A:** ChatGPT/Codex asistió a QA, revisión de capturas/fuentes y consolidación; Erick ejecutó las acciones manuales y las cinco pruebas Maven de usuarios. La validación realizada y los límites están detallados en el registro.

**Estado:** En curso, pendiente de aceptación contra la DoD. Esta actualización no cambia el sprint ni registra una ceremonia o una aprobación del equipo.

---

## PMS-272

Fuente: https://gean-team-isil.atlassian.net/browse/PMS-272

**Revisión documental HU-MAN-06 — 24/11/2026**

**Resultado: CUMPLE PARCIALMENTE.** PMS-224 incorpora ahora los resultados registrados en PMS-222/223 y sus límites. No se invalidan esos casos, pero no bastan para aceptar la asociación entre activo e intervenciones.

**Hallazgo reproducido en lógica aislada:** sobre los predicados extraídos sin modificar de [HistorialActivosService](https://github.com/ericknator/Pro---Mantenimiento/blob/7bedd1ad27fcc40d56e021f46b8d0dcd55a3c7fc/frontend/src/app/core/services/historial-activos.service.ts), main 7bedd1ad27fcc40d56e021f46b8d0dcd55a3c7fc, se probaron datos sintéticos en Node: una tarea de B con el mismo tipo que A se incluye en A; una incidencia sin categoría y sin relación se incluye por includes(''); una incidencia de otro ascensor se incluye por texto. Resultado: tres inclusiones incorrectas, control positivo por ID correcto. No es prueba de Angular, API ni entorno desplegado.

**Otros hallazgos estáticos:** activo \[QA\] fijo cuando la lista de activos está vacía; errores HTTP tratados como listas de intervenciones vacías. Se documentaron en PMS-224.

**Para cerrar:** corregir vinculación inequívoca, evitar activos de respaldo ficticios y diferenciar error/ausencia; registrar pruebas con dos activos del mismo tipo, categoría ausente, lista vacía y backend fallando; revalidar CA-01/CA-02 y conciliar PMS-224. No se declara corregido el código ni aceptada PMS-20. ChatGPT/Codex: revisión estática y prueba aislada; registrar en Anexo A.

**Antecedente: corrección preparada antes de la integración — 24/11/2026**
[PR #58, borrador](https://github.com/ericknator/Pro---Mantenimiento/pull/58), commit `492d9b57f985c51420aad32da6300bc304b54516`: elimina asociaciones textuales, activo QA fijo, fechas de respaldo inventadas y vacíos engañosos; añade advertencias de datos sin vínculo o fecha. Pasaron 11 pruebas de lógica con dependencias sustituidas y compilación Angular estricta dirigida al componente/plantilla. No es build completo ni QA en navegador/backend/despliegue.

**Bloqueo confirmado de contrato:** `IncidenciaEntity` no tiene relación con activo; la consulta de `/api/historial-activos` devuelve `codigoActivo`/`activoNombre` NULL para incidencias. El borrador excluye las incidencias sin vínculo y advierte que el historial puede estar incompleto: no completa CA-01 ni reemplaza la necesidad de persistir una relación real validada por el equipo. Puede reducir los resultados de la demo previa. PR sin integrar; PMS-272 y PMS-20 permanecen abiertas. Evidencia y fila para Anexo A en `docs/revisiones/PMS-272-revision-2026-11-24.md` del PR.

**Actualización de integración y brecha vigente — 24/11/2026**

La referencia previa al PR #58 como borrador y sin integrar queda como antecedente de la revisión inicial. [PR #58](https://github.com/ericknator/Pro---Mantenimiento/pull/58) está **fusionado** en `7df77f0a91cdde34b4b4c71b372615a66685be88`. Se verificó el estado del PR y el código del clon oficial.

**Resultado actual: ⚠️ CUMPLE PARCIALMENTE.** La corrección defensiva ya elimina asociaciones por texto y activos/fechas de respaldo, diferencia errores de consulta y utiliza relaciones explícitas por ID/código. En la integración se aprobó el build Angular development completo y las 11 pruebas aisladas de lógica; no se presenta esta revisión como nueva ejecución de QA del historial en navegador.

**Qué falta y por qué importa:** `IncidenciaEntity` no persiste una relación con `ActivoEntity`; la rama de incidencias de `HistorialActivoRepository` aún devuelve NULL para `codigo_activo` y `activo_nombre`. El frontend excluye esas incidencias y advierte que el historial puede estar incompleto. Por ello no se puede demostrar todavía CA-01 con las fallas reales del activo.

**Corrección propuesta, pendiente de acordar e implementar:** definir dónde y quién captura la asociación incidencia–activo; persistir la relación y exponerla en el contrato del API; conectar el historial a esa relación. No asignar retrospectivamente activos por similitud de texto.

**Evidencia necesaria para cerrar:** dos activos del mismo tipo con registros asociados inequívocamente; cada historial debe excluir los registros ajenos y ordenar tareas/fallas reales. Comprobar también ausencia real de intervenciones, datos sin vínculo y error del backend; actualizar la trazabilidad de PMS-224 y validar CA-01/CA-02 con versión y resultados identificados.

Se conserva el QA previo registrado por Rodrigo. Esta revisión documental no acepta HU-MAN-06 ni cambia los estados de PMS-20/PMS-272.

---

## PMS-224

Fuente: https://gean-team-isil.atlassian.net/browse/PMS-224

**HU-MAN-06: Consulta del historial de activos**

**Historia de usuario.** Como administrador, quiero consultar el historial de fallas y mantenimientos de cada activo para evaluar su comportamiento.

**Criterios de aceptación**

* HU-MAN-06-CA-01. Dado un administrador con un activo que tiene registros históricos, cuando abre la ficha del activo, entonces visualiza la secuencia cronológica de tareas y fallas asociadas.
* HU-MAN-06-CA-02. Dado un activo sin intervenciones, cuando abre su historial, entonces se informa que no existen registros, sin inventar resultados.

**Flujo funcional**

1. El administrador abre la ficha de un activo y accede a su historial.
2. La pantalla muestra una cabecera con la ficha técnica del equipo.
3. Debajo se presentan pestañas de filtrado: Todos, Mantenimientos y Fallas.
4. El historial se muestra como una secuencia cronológica. Los mantenimientos preventivos y las fallas se diferencian visualmente mediante bordes y badges.
5. El historial se arma consultando los servicios del backend de activos, tareas preventivas e incidencias, ordenados cronológicamente.
6. Si el activo no tiene intervenciones previas, el sistema informa que no existen registros y no muestra resultados ficticios.

**Trazabilidad**

* PMS-217 API para consultar historial de activos (Gean Huaman, 22/11/2026)
* PMS-218 Consulta cronológica de fallas y mantenimientos (Gean Huaman, 22/11/2026)
* PMS-219 Vista de historial del activo, front (Hans Ramirez, 16/11/2026)
* PMS-220 Integración del historial con el backend (Hans Ramirez, 16/11/2026)
* PMS-221 Diseño de la vista cronológica del historial (Rodrigo Vargas, 17/11/2026)
* PMS-222 QA visualización cronológica del historial, CA-01 (Rodrigo Vargas)
* PMS-223 QA historial de activos sin intervenciones, CA-02 (Rodrigo Vargas)

**Resultados de QA registrados por Rodrigo (consulta 24/11/2026)**

* PMS-222 (Listo): activo QA-MAN06 Ascensor Torre 1, ACT-4F369B3D; registra tres eventos y filtros Mantenimientos (1) y Fallas (1).
* PMS-223 (Listo): activo QA-MAN06 Bomba de agua Torre 2, ACT-3E9E8490; conserva el alta real y muestra ausencia de intervenciones en los filtros específicos.
* Son resultados registrados por QA; no se atribuye una nueva ejecución en navegador a esta revisión.

**Hallazgos que limitan la aceptación — revisión 24/11/2026 (ChatGPT/Codex)**

En [HistorialActivosService](https://github.com/ericknator/Pro---Mantenimiento/blob/7bedd1ad27fcc40d56e021f46b8d0dcd55a3c7fc/frontend/src/app/core/services/historial-activos.service.ts) de main, la asociación usa OR entre ID/código y coincidencias textuales. Se ejecutaron en Node los predicados extraídos del archivo, con datos sintéticos explícitos: (1) una tarea del activo B cuyo título contiene el tipo del activo A se incluyó en A; (2) una incidencia sin categoría ni relación se incluyó porque nombre.includes('') es verdadero; (3) una incidencia de otro ascensor se incluyó por coincidencia del tipo. Los tres casos debían excluirse. El control positivo de tarea con ID correcto se incluyó. Esta prueba aislada no es una ejecución de Angular/API ni del entorno desplegado.

Además, cargarActivos agrega un activo \[QA\] fijo cuando la lista está vacía, y las consultas de tareas/incidencias convierten errores HTTP en listas vacías. No debe documentarse que la ausencia de intervenciones está acreditada para todos los escenarios.

**Corrección necesaria:** vincular por relación inequívoca del activo o por el contrato de historial específico; eliminar alta de activos de respaldo inventados; distinguir error de consulta de un historial vacío. Validar dos activos del mismo tipo, categoría ausente, lista real vacía y error del backend, además de repetir CA-01/CA-02 sobre la versión corregida. PMS-272 permanece abierta.

**Antecedente: corrección preparada antes de la integración — 24/11/2026**
[PR #58, borrador](https://github.com/ericknator/Pro---Mantenimiento/pull/58), commit `492d9b57f985c51420aad32da6300bc304b54516`: elimina asociaciones textuales, activo QA fijo, fechas de respaldo inventadas y vacíos engañosos; añade advertencias de datos sin vínculo o fecha. Pasaron 11 pruebas de lógica con dependencias sustituidas y compilación Angular estricta dirigida al componente/plantilla. No es build completo ni QA en navegador/backend/despliegue.

**Bloqueo confirmado de contrato:** `IncidenciaEntity` no tiene relación con activo; la consulta de `/api/historial-activos` devuelve `codigoActivo`/`activoNombre` NULL para incidencias. El borrador excluye las incidencias sin vínculo y advierte que el historial puede estar incompleto: no completa CA-01 ni reemplaza la necesidad de persistir una relación real validada por el equipo. Puede reducir los resultados de la demo previa. PR sin integrar; PMS-272 y PMS-20 permanecen abiertas. Evidencia y fila para Anexo A en `docs/revisiones/PMS-272-revision-2026-11-24.md` del PR.

**Actualización de integración y brecha vigente — 24/11/2026**

La referencia previa al PR #58 como borrador y sin integrar queda como antecedente de la revisión inicial. [PR #58](https://github.com/ericknator/Pro---Mantenimiento/pull/58) está **fusionado** en `7df77f0a91cdde34b4b4c71b372615a66685be88`. Se verificó el estado del PR y el código del clon oficial.

**Resultado actual: ⚠️ CUMPLE PARCIALMENTE.** La corrección defensiva ya elimina asociaciones por texto y activos/fechas de respaldo, diferencia errores de consulta y utiliza relaciones explícitas por ID/código. En la integración se aprobó el build Angular development completo y las 11 pruebas aisladas de lógica; no se presenta esta revisión como nueva ejecución de QA del historial en navegador.

**Qué falta y por qué importa:** `IncidenciaEntity` no persiste una relación con `ActivoEntity`; la rama de incidencias de `HistorialActivoRepository` aún devuelve NULL para `codigo_activo` y `activo_nombre`. El frontend excluye esas incidencias y advierte que el historial puede estar incompleto. Por ello no se puede demostrar todavía CA-01 con las fallas reales del activo.

**Corrección propuesta, pendiente de acordar e implementar:** definir dónde y quién captura la asociación incidencia–activo; persistir la relación y exponerla en el contrato del API; conectar el historial a esa relación. No asignar retrospectivamente activos por similitud de texto.

**Evidencia necesaria para cerrar:** dos activos del mismo tipo con registros asociados inequívocamente; cada historial debe excluir los registros ajenos y ordenar tareas/fallas reales. Comprobar también ausencia real de intervenciones, datos sin vínculo y error del backend; actualizar la trazabilidad de PMS-224 y validar CA-01/CA-02 con versión y resultados identificados.

Se conserva el QA previo registrado por Rodrigo. Esta revisión documental no acepta HU-MAN-06 ni cambia los estados de PMS-20/PMS-272.
