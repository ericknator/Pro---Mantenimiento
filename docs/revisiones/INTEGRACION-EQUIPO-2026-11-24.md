# Integración de aportes del equipo — 24/11/2026

Erick solicitó integrar los aportes del equipo en main. Este registro acredita la resolución de conflictos y las verificaciones ejecutadas; no registra una Sprint Review, aprobación de criterios de aceptación ni cierre de la DoD.

## Cambios integrados

| Referencia | Cambio | Resolución |
| --- | --- | --- |
| PR #52, rama original `416027d` | URL compartida de API para alertas e incidencias | Conservar servicios actuales de main y puerto 8086; no restaurar funciones antiguas ni puerto 8085. |
| PR #59, rama original `cc90be1` | Filtro SOLUCIONADA y pruebas de acceso a alertas | Mantener la corrección por código y la compatibilidad con nombres históricos. Las pruebas de alertas verifican una restricción ya existente. |
| PR #58, rama original `492d9b5` | Historial sin asociaciones o registros de respaldo inventados | Mantener relaciones explícitas y advertencias; usar la configuración compartida de API y adaptar el runner a esa importación real. |

Se conserva el código de alertas/rediseño y gestión de residentes ya incorporado hasta main `cf7bcae`. La integración no modifica SQL ni datos de MySQL, no crea cuentas de Firebase y no altera los archivos locales del clon de trabajo de Erick.

## Verificación ejecutada

| Verificación | Resultado observado | Alcance |
| --- | --- | --- |
| `npm run build -- --configuration development` | Aprobado; dos advertencias del componente de listado de incidencias | Aplicación Angular completa, no build de producción ni ejecución en navegador. |
| `tsc --project frontend/tsconfig.spec.json --noEmit` | Aprobado | Tipado de los specs, no ejecución de Karma. |
| `node scripts/test-filtros-catalogo.cjs` | 6 aprobados / 0 fallidos | Componente real, signals de Angular y servicio con datos sintéticos. |
| `node scripts/test-historial-service.cjs` | 11 aprobados / 0 fallidos | Servicio real transpilado; HTTP, Firebase y signals sustituidos por dobles. Carga la configuración real de API. |
| `AdminUsuarioServiceTest`, JUnit directo | 5 aprobados / 0 fallidos | Lógica del servicio, transacciones y compensación con dependencias simuladas. |
| `AlertaInternaPropiedadTest`, JUnit directo | 3 aprobados / 0 fallidos | Controlador/servicio reales, HTTP MockMvc y repositorios simulados. Autor 200; residente ajeno 403; listado propio vacío 200. |
| `git diff --check` | Aprobado | Cambios contra main inicial. |
| Maven offline con versiones del POM | Bloqueado | No están disponibles Firebase Admin 9.12.0 y starter-validation 4.1.1 en la caché del entorno. No se registra como prueba aprobada. |

JUnit se ejecutó con javac/Java 25, `-parameters` para el controlador, Lombok y bibliotecas locales en caché, incluido Firebase Admin 8.0.1. Se compilaron los servicios y sus dependencias desde la fuente de la combinación local. Los dos componentes administrativos que necesitan Jakarta Validation no formaron parte de esa compilación alternativa. No equivale al build completo de Maven con las dependencias declaradas. El mensaje de recuperación de cuenta que emite la prueba de compensación fallida es un resultado esperado con un UID sintético.

La primera ejecución del runner de historial falló porque no conocía la nueva importación de API; se corrigió cargando el archivo real de configuración y la nueva ejecución aprobó los 11 casos. La primera ejecución directa de MockMvc carecía de metadatos de parámetros; al compilar el controlador con `-parameters` aprobó los tres casos. Estos ajustes no se presentan como defectos de la aplicación.

## Pendientes funcionales que continúan abiertos

- HU-MAN-06/PMS-272: persistir la relación real incidencia–activo y verificar el historial con datos de integración. Las incidencias sin relación no se asignan por semejanza de texto; la pantalla advierte que el historial puede estar incompleto.
- PMS-276: iniciar sesión desde navegador con un residente recién creado y verificar su unidad en el entorno de demostración.
- PMS-214/PMS-267: recorrido visual del filtro y comprobación con dos cuentas en el entorno integrado.
- Maven completo con las versiones declaradas, Karma, MySQL/Firebase reales y entorno desplegado: no se verificaron en esta ejecución.
- Las tareas de Jira conservan su estado; esta integración no las marca Done.

## Registro para Anexo A

| Herramienta | Fase y actividad | Artefactos o componentes | Validación realizada y pendiente |
| --- | --- | --- | --- |
| ChatGPT/Codex | Integración del 24/11/2026 solicitada por Erick; revisión de conflictos, configuración, pruebas y documentación | PR #52/#59/#58, API compartida, historial, filtros y este registro | Build Angular development, tipado, 17 casos de frontend y 8 casos JUnit aprobados con los límites descritos. Pendientes aceptación del equipo sobre el flujo real, navegador, dependencias completas y despliegue. |
