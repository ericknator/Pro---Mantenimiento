# PMS-276 — Validación funcional y automatizada del 24/11/2026

## Alcance y versión

Validación manual ejecutada por Erick, con asistencia de ChatGPT/Codex para revisar resultados y documentarlos. Se utilizó el clon habitual de Pro-Mantenimiento, actualizado a `7df77f0a91cdde34b4b4c71b372615a66685be88`: frontend en `localhost:4200`, backend en `localhost:8086/promantenimiento` y los servicios configurados en ese entorno. Esta sesión no corresponde al smoke aislado de `demo-pms276`.

Los nombres, correos y la incidencia utilizados son datos sintéticos de QA. No se presentan como residentes ni fallas reales del condominio. Esta validación no es una Sprint Review ni acredita un despliegue externo o la aceptación integral de la DoD.

## Resultados manuales observados

| Criterio | Caso ejecutado | Resultado y evidencia |
| --- | --- | --- |
| CA-01 | Alta de propietario desde administración | `POST /api/admin/usuarios` respondió **201 Created**. El listado pasó de 9 a 10 usuarios. La nueva cuenta quedó como RESIDENTE, T01–Dpto. 401, propietario; permaneció tras recargar. Adjuntos Jira 10293 y 10286. |
| CA-01 | Alta de inquilino desde administración | Tras usar un correo distinto, el listado recargado mostró **11 usuarios activos** y la cuenta como RESIDENTE, T01–Dpto. 201, inquilino. La captura muestra el GET posterior con 200; no contiene el POST de esa alta y no se le atribuye un 201 no capturado. Adjunto 10291. |
| CA-02 | Correo que ya tiene perfil registrado | El intento con el correo del propietario devolvió **409 Conflict**, con el mensaje “Ya existe un perfil con ese correo.” El contador visible permaneció en 10. Adjunto 10290. |
| CA-03 | Unidad inexistente `999999`, administrador autenticado | Respuesta **404**, código `UNIDAD_NO_ENCONTRADA` y mensaje “La unidad seleccionada no existe o está inactiva.” El contador visible era 11. La revisión del servicio sitúa la validación de la unidad antes de crear la identidad Firebase. Adjunto 10292. |
| CA-04 | Residente intenta entrar en administración | La navegación administrativa terminó en `/inicio`, sin mostrar el listado administrativo. Observado en las capturas de la conversación; la captura específica de redirección no integra este conjunto de nueve adjuntos. |
| CA-04 | Residente invoca directamente el alta por API | `POST /api/admin/usuarios`, con la autorización de esa sesión y cuerpo `{}`, devolvió **403 Forbidden**. Es una prueba de rechazo por rol anterior al procesamiento del alta; no una prueba de validación de un alta completa. Adjunto 10285. |
| CA-06 | Ingreso del propietario recién creado | La cuenta inició sesión, el área de residente mostró “Hola, Prueba” y `GET /api/auth/perfil` respondió 200. El Preview identificó usuario **10** con rol **RESIDENTE**. Adjuntos 10287 y 10288. |
| CA-06 | Operación permitida con unidad asociada | La incidencia sintética **INC-2026-0004** se registró y apareció en una consulta posterior. El JSON identificó solicitante **10**, unidad **4**, número **401**, piso **4**, torre **T01** y estado REPORTADA. Adjunto 10289. |

El endpoint `/api/auth/perfil` devuelve identidad y rol; no devuelve la unidad. El reconocimiento de la unidad se comprobó mediante la incidencia y su respuesta posterior, no a través de un campo inexistente del perfil.

Cuentas de QA:
- Propietario: `qa.integracion.20261124@example.test`.
- Inquilino: `qa.inquilino.20261124@example.test`.

No se incluyen claves temporales, tokens ni credenciales de servicios.

## CA-05 y pruebas Maven

### Ejecutadas por Erick en el clon oficial

Comando:

```bash
cd backend/ProMantenimiento
mvn -Dtest=AdminUsuarioServiceTest test
```

Resultado: **BUILD SUCCESS; 5 pruebas, 0 fallos, 0 errores, 0 omitidas**. Maven compiló los **272 archivos Java con release 25**. El resumen Surefire fue contrastado con el archivo generado por esa ejecución.

Casos:
1. Registrar Firebase, perfil, relación y auditoría.
2. Rechazar una relación no permitida antes de contactar Firebase.
3. Compensar Firebase si falla la persistencia MySQL.
4. Compensar Firebase si falla el commit después de guardar.
5. Conservar el fallo original y registrar recuperación pendiente si Firebase no elimina.

La línea `RECUPERACION_ALTA_RESIDENTE_PENDIENTE` con el UID sintético de la prueba es un resultado esperado del quinto caso. Las pruebas utilizan mocks: no ocurrió una caída real de MySQL ni de Firebase y no se acredita con ellas una eliminación real de cuentas.

### Regresión de acceso a alertas ejecutada por el asistente

Se compararon las fuentes Java, pruebas y POM con el clon oficial: **276 archivos comparados, sin diferencias**. Se ejecutó `AlertaInternaPropiedadTest` mediante Maven con las dependencias declaradas.

La primera ejecución quedó bloqueada por la autoanexión del agente de Mockito en este entorno. Con Byte Buddy cargado al iniciar la JVM, la ejecución dirigida finalizó con **BUILD SUCCESS; 3 pruebas, 0 fallos, 0 errores, 0 omitidas**:
- Autor consulta su alerta: 200.
- Otro residente consulta ese ID: 403 y cuerpo vacío.
- Listado propio vacío del segundo residente: 200 y lista vacía.

Invocación utilizada en el entorno del asistente, con las dependencias ya disponibles:

```bash
mvn --offline --batch-mode \
  -Daether.syncContext.named.factory=noop \
  -DargLine=-javaagent:/home/erick/.m2/repository/net/bytebuddy/byte-buddy-agent/1.18.11/byte-buddy-agent-1.18.11.jar \
  -Dtest=AlertaInternaPropiedadTest test
```

Son **dos ejecuciones dirigidas separadas**, con 8 casos aprobados entre ambas. No equivalen a ejecutar todos los tests del repositorio. Las tres pruebas de alertas usan HTTP simulado y repositorios sustituidos; no son una nueva prueba con dos cuentas reales en navegador.

## Trazabilidad de evidencias

Las nueve capturas originales se adjuntaron a [PMS-276](https://gean-team-isil.atlassian.net/browse/PMS-276). Los nombres, IDs de adjunto, tamaños y hashes SHA-256 están en [PMS-276-evidencias-2026-11-24.json](PMS-276-evidencias-2026-11-24.json), junto con los resúmenes sanitizados de Surefire.

| Adjunto Jira | Captura original | Contenido |
| --- | --- | --- |
| 10293 | image(20261124-163618).png | Alta de propietario, 201 y contador 10. |
| 10286 | image(20261124-163802).png | Propietario conservado al consultar nuevamente. |
| 10287 | image(20261124-163834).png | Ingreso del propietario y perfil 200. |
| 10288 | image(20261124-164042).png | Preview del perfil con ID 10 y rol RESIDENTE. |
| 10289 | image(20261124-164757).png | Incidencia y unidad 401, piso 4, torre T01. |
| 10285 | image(20261124-171103).png | Alta por API rechazada al residente: 403. |
| 10290 | image(20261124-180013).png | Correo duplicado: 409 y mensaje. |
| 10291 | image(20261124-181428).png | Inquilino persistido y contador 11. |
| 10292 | image(20261124-181754).png | Unidad inexistente: 404 y código de dominio. |

## Límites y pendientes de aceptación

- La sesión documenta el duplicado con perfil existente y una unidad inexistente. No se atribuyen pruebas nuevas de correo existente exclusivamente en Firebase ni de una unidad inactiva.
- Se comprobó el alta del inquilino, pero no su inicio de sesión ni una operación posterior desde esa cuenta.
- No se hizo una consulta directa de Firebase ni de `usuario_unidad` después de los rechazos. Se conserva como evidencia la respuesta de la API, el listado observado y el orden de validación revisado en el código.
- La persistencia real de la auditoría no se consultó directamente en esta sesión; su llamada de guardado está cubierta en el test unitario.
- Karma, build de producción, revisión de aceptación por el equipo y pruebas del entorno desplegado no se acreditan con este registro.
- Las pruebas previas de filtros en PMS-212/PMS-215 se conservan. Esta sesión no se presenta como una nueva ejecución manual de esos filtros.
- PMS-276 permanece **En curso**. No se cambia su sprint, no se inventa una aprobación y no se cierra la DoD por la existencia de estas capturas.

## Registro para Anexo A

| Herramienta | Fase y actividad | Artefactos o componentes | Validación y límites |
| --- | --- | --- | --- |
| ChatGPT/Codex | Asistencia a QA y consolidación del 24/11/2026 | PMS-276, capturas aportadas por Erick, reportes Maven y este registro | Contraste de capturas, fuentes y reportes; 5 casos Maven ejecutados por Erick y 3 de regresión por el asistente. Las acciones manuales y las pruebas simuladas se distinguen expresamente. Pendientes de aceptación indicados arriba. |
