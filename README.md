# Pro-Mantenimiento

**Plataforma web para la gestión de incidencias, mantenimiento y alertas internas en condominios**

**Proyecto Tecnológico · ISIL · 2026-II**  
**Caso piloto:** Condominio Nuevo Alcázar — Rímac, Lima, Perú.

> **Estado del proyecto:** en desarrollo (Sprint 3). Las funcionalidades integradas y las pruebas locales no equivalen al cierre de la Definition of Done ni a la validación final del MVP.

---

## 1. Descripción

**Pro-Mantenimiento** es una solución web académica orientada a centralizar el registro y seguimiento de incidencias, las actividades de mantenimiento y la comunicación de alertas internas en condominios residenciales.

El sistema combina una interfaz web, servicios REST, autenticación de usuarios y persistencia de información. Su desarrollo sigue un proceso incremental organizado en Sprints, con trazabilidad del trabajo mediante Jira y GitHub.

## 2. Problema y objetivo

El proyecto aborda las limitaciones de gestionar incidencias y mantenimientos mediante canales dispersos, como comunicaciones de mensajería, registros físicos y hojas de cálculo. Esta dispersión dificulta consolidar el historial y seguir el estado de cada solicitud.

**Objetivo:** desarrollar una plataforma web que facilite el registro, la consulta, la asignación y el seguimiento de incidencias y actividades de mantenimiento en el caso piloto del Condominio Nuevo Alcázar.

## 3. Tecnologías

| Capa | Tecnología |
| --- | --- |
| Frontend | Angular 19, TypeScript, HTML y SCSS |
| Backend | Java 25 y Spring Boot 4.1.1 |
| Servicios | API REST |
| Persistencia | MySQL y Spring Data JPA |
| Autenticación | Firebase Authentication |
| Seguridad | Spring Security y validaciones por rol |
| Construcción | Angular CLI y Maven Wrapper |
| Gestión | Jira |
| Versionamiento | Git y GitHub |

Las versiones de Angular, Java y Spring Boot corresponden a los manifiestos del repositorio consultados en noviembre de 2026.

## 4. Arquitectura general

~~~text
Usuarios (residente, seguridad, mantenimiento, administrador)
                            |
                            v
                  Frontend Angular
                            |
                     Peticiones REST
                            |
                            v
                   Backend Spring Boot
                      /           \
                     v             v
                   MySQL      Firebase Auth
~~~

El frontend presenta los flujos según el rol; el backend expone los endpoints de negocio y aplica controles de acceso para las operaciones protegidas. MySQL almacena datos del sistema y Firebase Authentication participa en la autenticación de los usuarios.

## 5. Módulos y avances

### Gestión de incidencias

El repositorio contiene pantallas y servicios para registrar incidencias, visualizar listados y detalles, y consultar su seguimiento. Los criterios de aceptación y el alcance concluido se controlan en Jira por historia de usuario.

### Mantenimiento

Incluye componentes vinculados con la programación de mantenimientos, registro de activos y consulta de tareas asignadas. Cada funcionalidad requiere su propia validación contra los criterios de aceptación antes de considerarse finalizada.

### Alertas internas

En la rama principal se encuentran integradas estas rutas:

| Rol | Acción | Ruta |
| --- | --- | --- |
| Residente | Registrar alerta interna | **/modulo/alertas** |
| Residente | Consultar sus alertas | **/modulo/mis-alertas** |
| Portería / seguridad | Consultar bandeja | **/seguridad/alertas** |

El historial del residente consulta las alertas asociadas a su cuenta autenticada. Se han realizado pruebas locales de lectura y restricciones de acceso para estos recorridos.

Están integrados el acuse de recepción, las transiciones de estado y el rediseño de la bandeja de portería y del seguimiento del residente. Queda pendiente validar el recorrido completo en el entorno que se demostrará; la integración del código no acredita por sí sola la aceptación de las historias.

### Gestión de residentes

La ruta **/administrador/residentes** permite registrar propietarios e inquilinos y asociarlos a una unidad. La API está restringida al rol administrador. Sigue pendiente validar desde el navegador el inicio de sesión del residente recién creado y el reconocimiento de su unidad.

### Historial de activos

El historial utiliza relaciones explícitas por ID/código y distingue errores de consulta de resultados vacíos. No genera activos ni fechas de respaldo. Las incidencias sin vínculo explícito a un activo quedan excluidas con advertencia: la relación persistida incidencia–activo sigue pendiente y HU-MAN-06 no se declara aceptada.

Integración y límites de las pruebas: `docs/revisiones/INTEGRACION-EQUIPO-2026-11-24.md`.

### Roles contemplados

- Residente
- Portería y seguridad
- Personal de mantenimiento
- Administrador

El sistema diferencia rutas y operaciones de acuerdo con el rol. La autorización de endpoints protegidos debe verificarse también en el backend, no solo en la navegación Angular.

## 6. Estructura del repositorio

~~~text
Pro---Mantenimiento/
├── frontend/                  # Aplicación Angular
│   ├── src/
│   ├── package.json
│   └── angular.json
├── backend/
│   └── ProMantenimiento/      # Proyecto Java / Spring Boot
│       ├── src/
│       ├── pom.xml
│       └── mvnw
├── database/
│   ├── scripts/               # Scripts SQL
│   ├── consultas/             # Consultas de apoyo
│   └── docs/                  # Documentación de base de datos
├── docs/                      # Espacio para documentación complementaria
├── .gitignore
└── README.md
~~~

La estructura representa los directorios existentes en el repositorio. **docs/** se conserva como espacio de documentación; no se atribuyen contenidos aún no publicados.

## 7. Requisitos para desarrollo local

- Node.js y npm compatibles con Angular 19.
- JDK **25**.
- MySQL.
- Git.
- Configuración local válida para Firebase Authentication y el backend.
- Acceso a las dependencias de Maven y npm.

**Seguridad:** no subir al repositorio contraseñas, archivos privados de credenciales, tokens, cadenas de conexión sensibles ni llaves de servicio. Configurar cada entorno mediante los mecanismos acordados por el equipo.

## 8. Ejecución local

### Frontend

Desde la raíz del repositorio:

~~~bash
cd frontend
npm ci
npm start
~~~

La aplicación Angular se sirve habitualmente en **http://localhost:4200**.

Para compilar:

~~~bash
cd frontend
npm run build
~~~

### Backend

En Linux, usando el Maven Wrapper incluido:

~~~bash
cd backend/ProMantenimiento
./mvnw spring-boot:run
~~~

Antes de iniciar, el backend requiere la configuración local de base de datos, autenticación y servicios correspondiente al entorno. El frontend también necesita que la URL de su API apunte al backend disponible.

### Base de datos

Los scripts y recursos SQL están organizados en **database/scripts/**, **database/consultas/** y **database/docs/**. Aplicar únicamente la secuencia y versión de scripts acordada para el entorno; este README no presupone una instalación automática ni una migración validada.

## 9. Trabajo ágil y trazabilidad

El proyecto se desarrolla mediante Sprints y se gestiona con:

- **Jira:** historias de usuario, tareas, responsables, estados, criterios de aceptación y seguimiento.
- **GitHub:** ramas de trabajo, commits, Pull Requests e integración de cambios.
- **Validación:** compilaciones, pruebas de comportamiento y evidencias verificables vinculadas a cada entregable.

Una funcionalidad se considera terminada solo al comprobar sus criterios de aceptación y la **Definition of Done** correspondiente. Las actividades Scrum y sus métricas deben reflejar hechos reales, no registros reconstruidos para aparentar ejecución.

## 10. Estado y alcance de las evidencias

**Estado documentado: Sprint 3 en desarrollo.**

Existen avances de frontend y backend integrados en **main**. Entre las comprobaciones locales documentadas figuran compilaciones Angular, consultas de alertas de residentes y restricciones de acceso según el rol.

**Aún requieren confirmación para el cierre:** pruebas integrales del MVP, estado de despliegue verificable, funcionalidad real de acuse de alertas y cumplimiento final de las historias y de la Definition of Done. No se presenta el producto como desplegado en producción.

## 11. Contexto académico

Proyecto desarrollado para el curso **Proyecto Tecnológico de ISIL**, con el **Condominio Nuevo Alcázar** (Rímac, Lima) como caso piloto.

La documentación académica, el backlog, las revisiones de Sprint y las evidencias de pruebas complementan el software, pero no sustituyen una demostración funcional del producto.

---

**Pro-Mantenimiento · Proyecto Tecnológico ISIL · 2026-II**
