# PMS-272 — Relación entre incidencia y activo

Propuesta del 24/11/2026 sobre main `7df77f0a91cdde34b4b4c71b372615a66685be88`. Complementa el historial integrado en PR #58 y la trazabilidad PMS-20/HU-MAN-06 → PMS-224 → PMS-272. No acredita cierre de la historia ni modifica el estado de las tareas del equipo.

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

## Recorrido dirigido pendiente

Este recorrido es una propuesta de validación, no una actividad ya realizada:

1. Usar dos activos reales identificados por ID/código, preferiblemente del mismo tipo, y una incidencia de prueba explícitamente identificada.
2. Como administrador, vincular la incidencia al primero. Recargar y comprobar el mismo ID en la API y en `incidencia.activo_id`, además de la auditoría.
3. Consultar ambos historiales: la incidencia solo debe aparecer en el del activo seleccionado, con su fecha registrada.
4. Cambiar la asociación al segundo y repetir la comprobación. Retirar la relación y comprobar que deja de aparecer en ambos.
5. Con un usuario residente, solicitar la misma operación y comprobar 403 sin cambios persistidos.
6. Probar activo inexistente/inactivo y registrar el rechazo sin asociación ni auditoría de éxito.
7. Consultar un activo sin intervenciones vinculadas; verificar el mensaje vacío. Las incidencias generales sin activo no deben producir vínculos ni advertencias de contrato incompleto.
8. Verificar la consulta `/api/historial-activos` y la conservación de la clasificación/estado de la incidencia. Registrar cualquier brecha antes de aceptar CA-01/CA-02.

Pendientes: persistencia a través del servicio y rollback de su transacción/auditoría, filtro HTTP con autenticación Firebase, navegador, revisión del equipo y entorno desplegado. La migración, su repetición y el rollback de los registros SQL sintéticos se comprobaron posteriormente en el terminal de Erick. La imposibilidad de acceder al servicio Docker desde este entorno impidió preparar aquí una base aislada; no se intentó modificar la base en uso.

## Registro propuesto para el Anexo A

| Herramienta | Fase y actividad | Componente | Validación y pendientes |
| --- | --- | --- | --- |
| ChatGPT/Codex | 24/11/2026; implementación asistida de relación incidencia–activo | Servicio/endpoint, entidad, migración incremental, selector administrativo e historial | 20 pruebas Maven y 14 de lógica aprobadas, build Angular development y tipado. Migración y relaciones SQL comprobadas después por Erick en MySQL 8.4.11. Pendientes revisión del equipo, servicio/auditoría, Firebase/navegador y demostración del flujo real. |

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
