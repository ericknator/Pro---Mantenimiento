# PMS-272 — Relación entre incidencia y activo

Implementación del 24/11/2026, integrada mediante PR #61 en main `490a241679e198beff31b3dfc85727aa905b3f23`, a partir de `7df77f0a91cdde34b4b4c71b372615a66685be88`. Complementa el historial integrado en PR #58 y la trazabilidad PMS-20/HU-MAN-06 → PMS-224 → PMS-272. No acredita cierre de la historia ni modifica el estado de las tareas del equipo.

## Estado vigente de integración — 24/11/2026

Erick autorizó integrar el PR #61. Se conserva el QA previo del equipo: PMS-222 y PMS-223 figuran Listo, con evidencia registrada por Rodrigo para CA-01 y CA-02. No se eliminan ni se atribuyen a esta sesión esas ejecuciones. La repetición de las tres pestañas no se establece como una nueva condición de aceptación.

La extensión se comprobó en la copia MySQL con vínculo A/B, cambio, retirada, recargas, auditoría y respuestas 401/403/400/404. La lectura de fechas/responsable del contrato actual pasó 16 pruebas de historial, build Angular development y tipado. También constan 20 casos Maven con mocks. El ajuste específico de fechas no tiene todavía una captura de historial combinado sobre el último commit; esto se distingue del QA previo y de las pruebas automatizadas.

Erick compartió la programación sintética de Equipo A (ACT-8080F397), frecuencia Bimestral, responsable Mantenimiento Prueba y primera tarea 25/11/2026 10:00, estado Programada. Se observó el mensaje de registro y GET de tareas con 200; no se atribuye a esa captura la aceptación de un mantenimiento ejecutado ni la comprobación del historial combinado.

Se revisaron fuentes, diferencias con main, resultados de prueba y metadatos del PR. GitHub no registró revisiones humanas ni hilos pendientes, y no devolvió ejecuciones de Actions ni estados CI para el head consultado. No se registra una aprobación independiente o una ejecución de CI que no ocurrió.

Erick ejecutó el respaldo y la migración en la base principal; el backend arrancó contra ella y la captura posterior muestra la aplicación abierta como administrador con las cuatro incidencias originales. Los detalles se registran en el cierre de instalación al final. Esto completa la integración local; el cierre formal de historia/DoD y el despliegue externo se distinguen de esta comprobación. Los apartados siguientes conservan la secuencia de preparación y los resultados observados en cada momento.

## Comportamiento

Administración puede relacionar una incidencia con un activo existente desde el detalle administrativo. El selector muestra código, nombre y ubicación. Se puede cambiar o retirar la relación; esto no clasifica la incidencia ni cambia su estado, prioridad o responsable. La operación se registra en auditoría con usuario, incidencia, fecha e identificadores anterior y nuevo.

La relación es opcional: una incidencia general puede permanecer sin activo. No se asignan activos a incidencias existentes por semejanza de nombres, categorías o ubicación. El historial incluye únicamente las relaciones explícitas; `activo: null` representa ausencia de asociación, mientras un contrato incompleto conserva la advertencia. El mensaje vacío indica ausencia de intervenciones vinculadas, sin afirmar que nunca ocurrieron intervenciones.

## Contrato y persistencia

- Columna nueva: `incidencia.activo_id`, nullable, con FK a `activo.id`.
- `PATCH /api/incidencia/{id}/activo`, restringido a ADMINISTRADOR tanto en seguridad HTTP como en el servicio.
- Cuerpo: `{"activoId": 2}`; el identificador es solo un ejemplo, debe existir y estar activo. `{"activoId": null}` retira la relación. Un cuerpo sin la propiedad se rechaza con 400.
- Respuesta: `{"incidenciaId": 7, "activo": {"id": 2, "codigo": "...", "nombre": "..."}}`, o `activo: null`.
- Sin sesión: 401; rol distinto o administrador inactivo: 403; incidencia inexistente o activo inexistente/inactivo: 404. Un identificador de activo no positivo se rechaza con 400.
- El campo `activo` se devuelve en las consultas de incidencias. Se ignora en la deserialización de los endpoints generales: la asociación se escribe mediante el endpoint administrativo.
- El historial SQL global también obtiene código y nombre del activo por la FK. La pantalla de historial conserva su consulta por relaciones explícitas.
- Cambio y auditoría comparten una transacción de Spring. La prueba con mocks comprueba propagación del error; el rollback real en MySQL sigue pendiente de verificar.

## Orden de instalación para validar

El backend de esta rama necesita la columna nueva incluso para consultar incidencias. La configuración habitual usa `ddl-auto=none`, por lo que se debe aplicar la migración antes de arrancarlo. No ejecutar de nuevo el script general de creación de la base.

1. Preparar un respaldo y una copia de la base para las pruebas. Mantener identificada la rama/versión anterior.
2. Seleccionar esa base en el cliente MySQL y ejecutar `database/scripts/04_PMS272_relacion_incidencia_activo.sql`. Revisar la columna y la FK antes de continuar. La ejecución posterior en el terminal de Erick se registra al final de este documento.
3. El script toma el tipo real de `activo.id` y consulta la existencia de la columna y la FK antes de emitir cada ALTER. Deja las incidencias existentes sin asociación; no contiene un relleno automático. La repetición y preservación de filas se comprobaron posteriormente en MySQL 8.4.11, según la evidencia de terminal de Erick.
4. Arrancar el backend de la rama y Angular con la configuración local habitual, conservando las credenciales fuera del PR.
5. Ejecutar el recorrido dirigido de la sección siguiente y registrar resultados observados. Integrar y actualizar la carpeta oficial después de validar el cambio.

Si se vuelve al código anterior, conservar la columna nullable y sus relaciones: el código anterior no las consulta. No quitar la columna como parte de un retroceso rutinario, porque eliminaría los vínculos guardados.

## Verificación ejecutada

Las ejecuciones se realizaron en una copia aislada de la fuente, sin cambiar la carpeta oficial ni la base de Erick.

| Verificación | Resultado observado | Límite |
| --- | --- | --- |
| Maven, Java 25, `IncidenciaActivoServiceTest` | 12 pruebas, 0 fallos, 0 errores | Dependencias de persistencia simuladas; MockMvc sin filtro de seguridad real. |
| Maven, `AdminUsuarioServiceTest` | 5 pruebas, 0 fallos, 0 errores | Regresión del alta y compensación con mocks. |
| Maven, `AlertaInternaPropiedadTest` | 3 pruebas, 0 fallos, 0 errores | Regresión de lectura/restricciones de alertas con mocks. |
| `node scripts/test-historial-service.cjs` | 14 pruebas, 0 fallos | Lógica real transpilada; transporte HTTP, autenticación y signals sustituidos. |
| `npm run build -- --configuration development` | Aprobado | Build completo de desarrollo, sin ejecución del navegador ni despliegue. Dos advertencias del listado de incidencias. |
| `tsc --noEmit -p tsconfig.spec.json` | Aprobado | Tipado de specs; no ejecución de Karma. |

Comando Maven usado en el entorno de revisión:

```sh
mvn --offline --batch-mode -Daether.syncContext.named.factory=noop \
  -DargLine=-javaagent:/home/erick/.m2/repository/net/bytebuddy/byte-buddy-agent/1.18.11/byte-buddy-agent-1.18.11.jar \
  -Dtest=IncidenciaActivoServiceTest,AdminUsuarioServiceTest,AlertaInternaPropiedadTest test
```

El agente explícito permite usar Mockito en este entorno. Su ruta corresponde a la caché local y debe adaptarse si se reproduce en otro equipo. No se cambió el POM ni la versión de Java.

## Recorrido propuesto inicialmente

Este listado conserva el plan inicial. Los resultados realmente ejecutados y los casos pendientes se distinguen en los apartados posteriores:

1. Usar dos activos reales identificados por ID/código, preferiblemente del mismo tipo, y una incidencia de prueba explícitamente identificada.
2. Como administrador, vincular la incidencia al primero. Recargar y comprobar el mismo ID en la API y en `incidencia.activo_id`, además de la auditoría.
3. Consultar ambos historiales: la incidencia solo debe aparecer en el del activo seleccionado, con su fecha registrada.
4. Cambiar la asociación al segundo y repetir la comprobación. Retirar la relación y comprobar que deja de aparecer en ambos.
5. Con un usuario residente, solicitar la misma operación y comprobar 403 sin cambios persistidos.
6. Probar activo inexistente/inactivo y registrar el rechazo sin asociación ni auditoría de éxito.
7. Consultar un activo sin intervenciones vinculadas; verificar el mensaje vacío. Las incidencias generales sin activo no deben producir vínculos ni advertencias de contrato incompleto.
8. Verificar la consulta `/api/historial-activos` y la conservación de la clasificación/estado de la incidencia. Registrar cualquier brecha antes de aceptar CA-01/CA-02.

Al preparar el plan quedaban pendientes persistencia a través del servicio y rollback de su transacción/auditoría, filtro HTTP con autenticación Firebase, navegador, revisión del equipo y entorno desplegado. La migración, su repetición y el rollback de los registros SQL sintéticos se comprobaron posteriormente en el terminal de Erick. La imposibilidad de acceder al servicio Docker desde este entorno impidió preparar aquí una base aislada; no se intentó modificar la base en uso.

## Registro propuesto para el Anexo A

| Herramienta | Fase y actividad | Componente | Validación y pendientes |
| --- | --- | --- | --- |
| ChatGPT/Codex | 24/11/2026; implementación asistida de relación incidencia–activo | Servicio/endpoint, entidad, migración incremental, selector administrativo e historial | 20 pruebas Maven y 16 de lógica aprobadas, build Angular development y tipado. Erick verificó migración en copia, vínculo/cambio/retirada en navegador, auditoría y permisos; luego aplicó respaldo/migración en la base principal y comprobó la apertura con sus cuatro incidencias. QA previo PMS-222/PMS-223 conservado. Pendientes los casos adicionales y el cierre formal contra DoD/despliegue. |

## Ejecución desde el terminal del equipo

Se preparó `scripts/pms272-test/validate-mysql-copy.sh`. Requiere Python 3 y los clientes MySQL; en CachyOS también reconoce los ejecutables incluidos con MySQL Workbench. Lee las credenciales locales sin mostrarlas ni agregarlas a Git y exige conexión a MySQL local.

```sh
bash scripts/pms272-test/validate-mysql-copy.sh /mnt/Datos/Proyectos/Pro---Mantenimiento
```

El script realiza únicamente lecturas de la base configurada en esa carpeta y crea una base nueva con prefijo `pms272_qa_`. Copia tablas y datos con mysqldump, sin triggers, rutinas ni eventos; no es un respaldo completo para recuperación. Conserva la copia para continuar la validación. En esa copia aplica la migración dos veces, compara todas las columnas originales de incidencias, comprueba la FK y ejecuta relaciones entre dos activos sintéticos del mismo tipo, cambio y retirada. Los registros sintéticos se revierten con ROLLBACK. Comprueba las filas y los conteos al finalizar.

Evitar registrar datos nuevos desde la aplicación mientras se obtiene la copia: si cambian entre lecturas, la comparación puede detener la validación y debe repetirse en una copia nueva. Los archivos temporales de datos y credenciales se eliminan al salir.

Estado inicial del entorno de revisión: sintaxis Bash aprobada; ejecución MySQL bloqueada en ese entorno. Desde el entorno de revisión las conexiones a localhost:3306 fueron rechazadas y no se pudo acceder a Docker. No se creó la copia ni se aplicó la migración. Este script comprueba SQL; la persistencia a través del servicio, auditoría, permisos HTTP/Firebase y navegador requieren una ejecución posterior contra la copia.

## Resultado observado en el terminal de Erick — 24/11/2026

Fuente: salida de terminal compartida por Erick tras ejecutar los scripts de la rama del PR #61 (`df3f40c227e4469a739394fb967fd0d873d13180`). Motor informado: MySQL 8.4.11. Se creó y conservó la copia `pms272_qa_20261124_144833_15027`.

| Comprobación | Resultado observado |
| --- | --- |
| Migración, primera y segunda ejecución | Ambas OK |
| Comparación de filas y columnas originales de incidencia | Preservadas, OK |
| Dos activos sintéticos distintos del mismo tipo | OK |
| Incidencia sintética sin vínculo inicial | OK |
| Asociación al activo A y exclusión del B | OK |
| Cambio al activo B y exclusión del A | OK |
| Retirada del vínculo conservando el estado | OK |
| Rollback de registros sintéticos y comprobaciones finales del script | Ejecución completada correctamente |

La salida final fue `VALIDACIÓN MYSQL COMPLETADA`. Los registros QA se revirtieron; no deben buscarse como datos persistentes de la demostración. Las pruebas realizaron SQL directo sobre la copia. No acreditan todavía el endpoint HTTP, la auditoría del servicio, los permisos con Firebase ni la interfaz del navegador. El PR continúa en borrador hasta comprobar ese recorrido. La base original se utilizó como origen de lectura del script.

## Recorrido de navegador observado — 24/11/2026

Erick ejecutó la rama `qa/pms272-validacion-20261124` desde la carpeta oficial. El log compartido confirmó Java 25, Tomcat iniciado en 8086 y conexión a `pms272_qa_20261124_144833_15027` (MySQL 8.4.11). Una primera ejecución no pudo ocupar el puerto; el arranque posterior fue correcto. El mensaje de Maven por sí solo no se registra como arranque exitoso.

Las capturas muestran dos activos sintéticos distintos en la copia, ambos de tipo Bomba de agua / cisterna:

| Activo | Código | Ubicación de prueba |
| --- | --- | --- |
| [QA PMS272] Equipo A | ACT-8080F397 | Zona de prueba A |
| [QA PMS272] Equipo B | ACT-4921CA90 | Zona de prueba B |

Se utilizó la incidencia de prueba INC-2026-0004 (id 4), cuya descripción indica expresamente que no corresponde a una falla real. Fuente de resultados: capturas compartidas por Erick en esta conversación.

| Paso observado | Detalle después de guardar y recargar | Historial A, Fallas | Historial B, Fallas |
| --- | --- | --- | --- |
| Asociación a A | ACT-8080F397; PATCH de asociación con 200 | 1, descripción de la incidencia QA | 0, Sin intervenciones vinculadas |
| Cambio de A a B | ACT-4921CA90; respuesta 200 y valor conservado tras recarga | 0, Sin intervenciones vinculadas | 1, descripción de la incidencia QA |
| Retirada de la relación | Relación retirada, respuesta 200 y Sin activo relacionado tras recarga | 0, Sin intervenciones vinculadas | 0, Sin intervenciones vinculadas |

La interfaz conserva estado REPORTADA, categoría Limpieza, prioridad Baja y ausencia de responsable asignado durante el recorrido. Las consultas de activos, tareas e incidencias mostraron respuestas 200 en las capturas de historial. El alta del activo cuenta como registro general; las pestañas Fallas no la cuentan como falla.

Esto acredita el guardado/lectura mediante la aplicación, el filtrado entre dos activos del mismo tipo y el vacío posterior a la retirada. No se observó todavía la tabla de auditoría ni se ejecutó con residente el PATCH nuevo. Tampoco se comprobaron por HTTP los errores de activo inexistente/inactivo, el rollback ante fallo de auditoría o el endpoint global `/api/historial-activos`. Esos límites permanecen separados de las pruebas unitarias y del ensayo SQL. No acredita la aceptación completa de HU-MAN-06, que incluye también mantenimientos y cronología.

No se incorporan a Git capturas con encabezados Authorization ni credenciales. El registro para Anexo A debe incluir esta validación manual realizada por Erick.

## Consulta de auditoría observada — 24/11/2026

Erick ejecutó una consulta de solo lectura en la copia `pms272_qa_20261124_144833_15027`. La fila id 4, código INC-2026-0004, devolvió `activo_id=NULL`. La tabla auditoria_sistema devolvió estos eventos para entidad incidencia, entidad_id 4 y acción ASOCIAR_ACTIVO_INCIDENCIA:

| Auditoría id | usuario_id | Detalle literal | creado_en informado por MySQL |
| --- | --- | --- | --- |
| 3 | 3 | activoAnteriorId=null;activoNuevoId=3 | 2026-11-24 15:12:29 |
| 4 | 3 | activoAnteriorId=3;activoNuevoId=4 | 2026-11-24 15:18:54 |
| 5 | 3 | activoAnteriorId=4;activoNuevoId=null | 2026-11-24 15:23:07 |

La secuencia corresponde al recorrido de A (id 3), B (id 4) y retirada observado en la interfaz. Esta consulta confirma el estado final persistido y los tres eventos con usuario y fecha. No acredita el rollback del servicio ante un fallo de auditoría ni una prueba de rechazo HTTP con residente. Esas verificaciones continúan separadas y pendientes. Fuente: salida del cliente MySQL compartida por Erick.

## Restricción HTTP con residente observada — 24/11/2026

La captura de Console compartida por Erick muestra `Perfil: 200 Rol: RESIDENTE`, seguida de un PATCH a `/promantenimiento/api/incidencia/4/activo` rechazado con HTTP 403. La comprobación previa del perfil distingue este resultado de un token inválido o una sesión ausente. El cuerpo utilizado fue `{"activoId":null}`.

Se acredita la restricción del endpoint real con una sesión de residente. No se atribuye un UID/correo concreto porque no se muestra en esa captura. La consulta MySQL anterior había confirmado el vínculo nulo y tres eventos; no se ejecutó todavía otra consulta de auditoría después del rechazo.

## Rechazos HTTP observados — 24/11/2026

Erick ejecutó en Console el bloque de cuatro solicitudes PATCH a `/promantenimiento/api/incidencia/4/activo`. Antes del bloque se verificó que `/api/auth/perfil` respondiera 200 con rol ADMINISTRADOR. La captura muestra la tabla completa con estos resultados:

| Caso | Cuerpo enviado | Autenticación | HTTP observado | Comparación |
| --- | --- | --- | --- | --- |
| Sin sesión | {"activoId":null} | Sin Authorization | 401 | OK: true |
| Cuerpo incompleto | {} | Administrador | 400 | OK: true |
| ID inválido | {"activoId":0} | Administrador | 400 | OK: true |
| Activo inexistente | {"activoId":999999} | Administrador | 404 | OK: true |

Los errores de red mostrados en rojo son los rechazos esperados de estas solicitudes. No se atribuyen a fallos del flujo de guardado válido. Fuente: captura de Console compartida por Erick. No se volvió a consultar auditoría después de los rechazos, por lo que no se afirma una comparación adicional de filas/eventos posterior a este bloque.

### Estado consolidado de la validación de este cambio

- Comprobados: migración y repetición en copia MySQL; preservación de filas originales; vínculo, cambio y retirada mediante navegador/API; persistencia tras recarga; aislamiento entre dos activos del mismo tipo; vacío al retirar la relación; auditoría del recorrido positivo; rechazo 403 con residente; rechazos 401/400/404 descritos arriba.
- Aprobados antes del recorrido manual: 20 casos Maven con mocks, 14 casos de lógica del historial, build Angular development y tipado de specs. No se vuelven a contabilizar las capturas como pruebas unitarias.
- Pendientes de integración/revisión: activo inactivo por HTTP (cubierto con mocks), rollback del servicio ante fallo real de auditoría, consulta global del historial, revisión del equipo y despliegue. La aceptación integral de HU-MAN-06 requiere además sus mantenimientos y cronología.
- La base principal no recibió la migración durante este recorrido. Antes de arrancar este backend contra ella debe aplicarse `04_PMS272_relacion_incidencia_activo.sql` con respaldo y revisar el resultado. El PR y la validación en una copia no realizan por sí mismos esa instalación.

## Alineación de tareas preventivas antes del recorrido combinado

Al revisar la prueba pendiente de CA-01 se contrastó `TareaPreventivaEntity` y el servicio de programación con el historial: el contrato actual devuelve `programadaPara` y `responsable`; el historial consultaba los alias `fechaProgramada` y `tecnico`. Esto podía usar `actualizadoEn` para una tarea programada y omitir su responsable informado.

Se añadieron dos casos con el contrato real: una tarea futura junto con una falla, y una tarea ejecutada cuya fecha de cierre difiere de programación/actualización. Los dos casos fallaron antes del ajuste; después aprobaron los 16 casos del historial (los 14 anteriores más estos 2). El historial usa fechaFin, fechaInicio o programadaPara según los datos disponibles, conserva alias históricos y usa actualizadoEn solo como respaldo registrado. Lee responsable y mantiene tecnico como compatibilidad. No reemplaza ninguna fecha por la hora de la prueba.

El cambio afecta solo la lectura del historial. No modifica la API de programación, los registros de mantenimiento, las asociaciones ni las pruebas positivas y de permisos ya realizadas. La prueba combinada en navegador sobre esta actualización sigue pendiente.

## Instalación preparada para la base principal

Con escrituras de la aplicación detenidas y main actualizado, ejecutar `bash scripts/pms272-test/install-main-schema.sh` desde la raíz oficial. El instalador solo admite el nombre local bdpromantenimiento20262 y se detiene si el respaldo falla. Conserva el dump con rutinas, triggers y eventos en un directorio privado fuera del repositorio, comprimido y con checksum. Después aplica el mismo SQL ensayado dos veces en la copia y verifica columna nullable, FK, conteos y todas las columnas originales de las incidencias. No cambia application.properties ni traslada los activos/tareas QA de la copia a la base principal.

La revisión de sintaxis Bash y Python embebido aprobó. No se ejecutó el instalador principal desde el entorno del asistente por falta de acceso a MySQL local. Tampoco se realizó un ensayo de restauración del respaldo principal. Tras ejecutarlo, iniciar el backend con la configuración habitual, sin el argumento que seleccionaba la base QA, y verificar la aplicación.

Si surge un problema de aplicación, detener el backend y evaluar volver al código anterior conservando la nueva columna nullable. No eliminar la columna ni restaurar destructivamente el dump sin revisar el estado de los datos. El dump es un respaldo recuperable; el instalador no ejecuta automáticamente una restauración.

## Cierre de instalación local observado — 24/11/2026

Erick ejecutó desde la carpeta oficial el cambio a main y el fast-forward a `490a241679e198beff31b3dfc85727aa905b3f23`. Se conservaron sus modificaciones locales de application.properties, el script SQL general y sus archivos sin seguimiento. No se publican sus valores de configuración ni se incorporan a Git.

El instalador seleccionó la base principal `bdpromantenimiento20262` en MySQL 8.4.11. La salida informó respaldo comprimido con suma coincidente y `MIGRACIÓN PRINCIPAL COMPLETADA: filas originales preservadas, columna y FK verificadas`. El directorio del respaldo es `pms272-20261124_161920.jzCPPi`, dentro de la ruta privada de respaldos documentada en README.

- Archivo: `base-principal.sql.gz`.
- SHA-256 leído de SHA256SUMS: `c30dce51ba60f1710d35d948818a147349bac37fece42d6158c804d9f5621807`.
- El checksum y el archivo comprimido se verificaron durante el instalador. No se ensayó una restauración de ese dump.

El log posterior confirmó JDBC `jdbc:mysql://localhost:3306/bdpromantenimiento20262`, Java 25 y arranque de Tomcat en 8086 con contexto `/promantenimiento`, seguido de `Started ProMantenimientoApplication` a las 16:19:26 (hora indicada por el log). No se confunde este arranque con la ejecución anterior contra la copia QA.

La captura posterior de `/administrador/incidencias/todas` muestra la sesión Administrador Prueba, el listado con cuatro incidencias y los códigos INC-2026-0004, INC-2026-0003, INC-2026-0002 e INC-2026-0001. Se confirma apertura/lectura del entorno principal tras migrar. La copia conserva por separado los activos y la programación sintéticos de QA. Esta captura no se presenta como una nueva ejecución de todo el recorrido de historial sobre la base principal.

Fuentes: salida de terminal compartida por Erick, archivo de checksum existente y captura de la aplicación. La integración local queda comprobada. El estado formal de la historia se rige por la DoD acordada; las pruebas adicionales no ejecutadas y el despliegue externo conservan los límites ya descritos.
