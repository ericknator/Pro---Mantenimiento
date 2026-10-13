# Pro-Mantenimiento — Base de Datos V4 FINAL

**Base de datos:** `bdpromantenimiento20262`  
**Motor objetivo:** MySQL 8.x  
**Total de tablas:** 47

## Correcciones incorporadas

- `rol_permiso`, `usuario_unidad`, `activo_proveedor` y `comunicado_destinatario` ahora usan `id` autoincremental como PK para simplificar el mapeo con Spring Data JPA; sus combinaciones funcionales se conservan como restricciones `UNIQUE`.
- Se incorporan `condominio` y `torre`, y `unidad_residencial` referencia ahora a `torre_id`.
- Se incorpora `tipo_accion_incidencia` y `actuacion_incidencia` lo referencia mediante FK.
- Se incorpora `tipo_evidencia`, reutilizado por evidencias de incidencias y mantenimiento.
- Se mantiene `usuario_perfil` en lugar de duplicar una tabla `usuario`, porque Firebase Authentication gestiona identidad/credenciales y MySQL conserva el perfil operativo.
- Se mantiene `auditoria_sistema` como evolución de la antigua `bitacoracambios`.
- Se mantiene `estado_tarea_preventiva` como evolución de `estadotarea` y `evidencia_mantenimiento` como evolución de `evidenciaintervencion`.
- Se mantiene separada la alerta preventiva (`tipo_alerta_mantenimiento` + `alerta_mantenimiento`) del flujo de notificaciones y comunicados.
- Se corrige el catálogo de roles incluyendo `PORTERIA_SEGURIDAD`, necesario para el módulo de visitas.

## Descripción de las 47 tablas

| N° | Módulo | Tabla | Descripción |
|---:|---|---|---|
| 1 | Seguridad, identidad y autorización | `rol` | Catálogo de roles funcionales de Pro-Mantenimiento, como administrador, residente y mantenimiento. |
| 2 | Seguridad, identidad y autorización | `permiso` | Catálogo granular de permisos que Spring Boot puede aplicar después de validar la identidad de Firebase. |
| 3 | Seguridad, identidad y autorización | `rol_permiso` | Tabla puente que relaciona roles con permisos y evita codificar autorizaciones rígidas en cada usuario. |
| 4 | Seguridad, identidad y autorización | `usuario_perfil` | Perfil operativo del usuario autenticado con Firebase; MySQL no almacena su contraseña. |
| 5 | Organización residencial | `condominio` | Registra la organización residencial atendida por la plataforma; en el piloto corresponde al Condominio Nuevo Alcázar del Rímac. |
| 6 | Organización residencial | `torre` | Representa cada torre física de un condominio y permite asociar las unidades residenciales con su ubicación estructural. |
| 7 | Organización residencial | `unidad_residencial` | Registra las unidades residenciales del condominio para asociar residentes, incidencias, cuotas y visitas. |
| 8 | Seguridad, identidad y autorización | `usuario_unidad` | Tabla puente que permite relacionar varios usuarios con una unidad y un usuario con más de una unidad autorizada. |
| 9 | Incidencias y proveedores | `categoria_incidencia` | Clasifica las incidencias reportadas para facilitar asignación, filtrado y análisis operativo. |
| 10 | Incidencias y proveedores | `prioridad_incidencia` | Catálogo de niveles de prioridad utilizados por administración para clasificar la urgencia de una incidencia. |
| 11 | Incidencias y proveedores | `estado_incidencia` | Catálogo del ciclo de vida de una incidencia: reporte, clasificación, asignación, atención, solución, cierre o reapertura. |
| 12 | Incidencias y proveedores | `tipo_accion_incidencia` | Catálogo de acciones formales que pueden registrarse sobre una incidencia, como clasificación, asignación, diagnóstico, solución o reapertura. |
| 13 | Incidencias y proveedores | `tipo_evidencia` | Catálogo común de tipos de evidencia utilizados en incidencias y mantenimientos, por ejemplo foto, video o documento. |
| 14 | Incidencias y proveedores | `proveedor` | Registra empresas o técnicos externos que pueden atender incidencias o ejecutar mantenimientos especializados. |
| 15 | Incidencias y proveedores | `proveedor_contacto` | Permite registrar contactos operativos de los proveedores para coordinar atención y mantenimiento. |
| 16 | Incidencias y proveedores | `incidencia` | Registro central del ticket de incidencia, con solicitante, clasificación, prioridad, estado y responsable vigente. |
| 17 | Incidencias y proveedores | `asignacion_incidencia` | Conserva el historial de responsables internos o proveedores asignados a una incidencia a lo largo de su atención. |
| 18 | Incidencias y proveedores | `actuacion_incidencia` | Bitácora cronológica de acciones y cambios de estado realizados durante la atención de una incidencia. |
| 19 | Incidencias y proveedores | `comentario_incidencia` | Registra comunicaciones vinculadas al ticket sin mezclar comentarios con cambios formales de estado. |
| 20 | Incidencias y proveedores | `evidencia_incidencia` | Almacena referencias a fotos, videos o documentos que sustentan el reporte y la atención de una incidencia. |
| 21 | Activos y mantenimiento preventivo | `tipo_activo` | Catálogo de clases de activos sujetos a mantenimiento, como ascensores, bombas, portones o luces de emergencia. |
| 22 | Activos y mantenimiento preventivo | `estado_activo` | Catálogo del estado operativo de los activos del condominio. |
| 23 | Activos y mantenimiento preventivo | `activo` | Ficha técnica básica de cada equipo o instalación cuya vida operativa y mantenimiento deben ser trazables. |
| 24 | Activos y mantenimiento preventivo | `activo_proveedor` | Relaciona activos con proveedores que realizan mantenimiento, soporte u otros servicios especializados. |
| 25 | Activos y mantenimiento preventivo | `frecuencia_mantenimiento` | Catálogo de periodicidades utilizadas para programar mantenimientos preventivos recurrentes. |
| 26 | Activos y mantenimiento preventivo | `estado_plan_mantenimiento` | Catálogo del estado de un plan preventivo: activo, pausado, finalizado u otro estado controlado. |
| 27 | Activos y mantenimiento preventivo | `plan_mantenimiento` | Define la programación recurrente de mantenimiento preventivo de un activo y sirve de origen para tareas periódicas. |
| 28 | Activos y mantenimiento preventivo | `estado_tarea_preventiva` | Catálogo del ciclo de vida de una tarea preventiva programada. |
| 29 | Activos y mantenimiento preventivo | `tarea_preventiva` | Instancia concreta de un mantenimiento preventivo con fecha, responsable, proveedor y estado de ejecución. |
| 30 | Activos y mantenimiento preventivo | `intervencion_preventiva` | Registra la ejecución efectiva de un mantenimiento, sus acciones, observaciones, ejecutor y costo cuando corresponda. |
| 31 | Activos y mantenimiento preventivo | `evidencia_mantenimiento` | Almacena las evidencias documentales o fotográficas asociadas a una intervención preventiva. |
| 32 | Activos y mantenimiento preventivo | `tipo_alerta_mantenimiento` | Catálogo de tipos de alerta preventiva del mantenimiento, principalmente mantenimiento próximo y mantenimiento vencido. |
| 33 | Activos y mantenimiento preventivo | `alerta_mantenimiento` | Registra alertas operativas de mantenimientos próximos o vencidos para reducir el riesgo de omitir tareas preventivas. |
| 34 | Notificaciones y comunicados | `tipo_notificacion` | Catálogo de eventos notificables del sistema, como cambios de estado o alertas de mantenimiento. |
| 35 | Notificaciones y comunicados | `notificacion` | Bandeja de notificaciones operativas dirigida a usuarios por eventos del flujo de incidencias y mantenimiento. |
| 36 | Notificaciones y comunicados | `comunicado` | Registra comunicados operativos publicados por la administración para residentes autorizados. |
| 37 | Notificaciones y comunicados | `comunicado_destinatario` | Relaciona comunicados con sus destinatarios y permite registrar lectura individual. |
| 38 | Control de visitas | `tipo_visita` | Catálogo utilizado para clasificar las visitas autorizadas por los residentes de una unidad. |
| 39 | Control de visitas | `estado_visita` | Catálogo del ciclo de vida de una autorización de visita: preautorizada, ingresada, finalizada, cancelada o vencida. |
| 40 | Control de visitas | `visita` | Registra la preautorización de una visita para una unidad residencial, incluyendo visitante, vigencia, tipo y estado. |
| 41 | Control de visitas | `acceso_visita` | Registra el ingreso y salida efectivos de una visita previamente autorizada para una unidad residencial. |
| 42 | Consulta administrativa básica | `estado_cuota` | Catálogo básico para indicar el estado administrativo de una cuota sin convertir el sistema en una solución contable integral. |
| 43 | Consulta administrativa básica | `cuota_unidad` | Registra información básica de cuotas por unidad para consulta de periodo, concepto, monto, vencimiento y estado. |
| 44 | Consulta administrativa básica | `movimiento_cuota` | Historial de cambios del estado administrativo de una cuota para mantener trazabilidad de actualización. |
| 45 | Consulta administrativa básica | `documento_pago` | Asocia constancias, boletas u otros documentos disponibles a una cuota para consulta administrativa básica. |
| 46 | Auditoría y configuración | `auditoria_sistema` | Bitácora técnica de acciones relevantes para apoyar trazabilidad, seguridad y soporte del sistema. |
| 47 | Auditoría y configuración | `parametro_sistema` | Centraliza parámetros operativos que pueden variar sin modificar el código fuente, como anticipación de alertas o límites configurables. |

## Validaciones ejecutadas

- 47 sentencias `CREATE TABLE` detectadas.
- 47 tablas con `COMMENT` descriptivo.
- 0 claves foráneas apuntando a tablas inexistentes.
- 0 nombres de `CONSTRAINT` duplicados.
- Las cuatro tablas puente observadas tienen `id` como PK y conservan una restricción `UNIQUE` funcional.
- `condominio`, `torre`, `tipo_accion_incidencia` y `tipo_evidencia` están incorporadas.

## Nota sobre datos del piloto

Se registra únicamente información estructural confirmada del Condominio Nuevo Alcázar: ubicación en Rímac, 12 torres y 8 pisos por torre. La dirección exacta se mantiene en `NULL` y no se generan automáticamente los 384 departamentos porque no se cuenta con la numeración real autorizada de cada unidad.