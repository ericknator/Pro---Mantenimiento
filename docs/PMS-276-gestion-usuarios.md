# PMS-276 — Gestión de usuarios

La configuración general usa el puerto 8086 del PR y el proyecto Firebase del equipo. El emulador solo se activa expresamente. Los scripts de prueba aislada de esta HU usan el perfil `pms276-test`, una base independiente y el proyecto `demo-pms276`; esos scripts no deben apuntar al entorno compartido.

## Entorno aislado

1. Iniciar MySQL en el puerto `3310`:

   ```bash
   docker compose -f database/pms276-test/docker-compose.yml up -d
   ```

2. Preparar estructura y catálogos. El script transforma el nombre de la base del script V4 y corta antes de los UID históricos de demo:

   ```bash
   bash database/pms276-test/prepare-schema.sh
   bash database/pms276-test/validate-schema.sh
   ```

   La validación exige 51 tablas (incluye el complemento aislado de las entidades de alertas internas), al menos una unidad activa y cero perfiles antes de crear el administrador aislado.

3. Iniciar Firebase Auth Emulator con el proyecto `demo-pms276`:

   ```bash
   npx firebase-tools emulators:start \
     --project demo-pms276 \
     --config firebase/pms276-test/firebase.json
   ```

4. En otra terminal, crear únicamente el administrador local y su perfil MySQL:

   ```bash
   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
     bash database/pms276-test/seed-admin.sh
   PMS276_EXPECT_USERS=1 bash database/pms276-test/validate-schema.sh
   ```

5. Ejecutar backend y frontend:

   ```bash
   cd backend/ProMantenimiento
   SPRING_PROFILES_ACTIVE=pms276-test SPRING_DATASOURCE_PASSWORD=pms276_test \
     FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 bash mvnw spring-boot:run

   cd frontend
   npm start
   ```

Con el perfil de prueba activo, el backend queda en `http://localhost:8086/promantenimiento` y usa `bdpromantenimiento_pms276_test` en `localhost:3310`.

6. Ejecutar la prueba integral contra los servicios aislados:

   ```bash
   FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
     bash database/pms276-test/smoke-api.sh
   ```

   El smoke test crea dos cuentas temporales únicamente en Auth Emulator y en la base aislada, verifica `401` sin token, `201` para propietario e inquilino, las asociaciones con unidades reales y `403` para un residente que intenta acceder a administración.

## API de administración

- `GET /api/admin/usuarios`: perfiles con sus unidades activas y relación.
- `GET /api/admin/usuarios/unidades`: catálogo de unidades activas con torre, piso y número.
- `POST /api/admin/usuarios`: crea cuenta Firebase, perfil `RESIDENTE`, relación `PROPIETARIO`/`INQUILINO` y auditoría.

El POST valida formato, longitudes, correo, clave temporal, relación, unidad activa y rol `RESIDENTE`. La clave temporal nunca se persiste en MySQL. Si el guardado de MySQL falla después de crear Firebase, se intenta eliminar la cuenta Firebase como compensación.

## Pruebas verificables

```bash
cd frontend
npm run build -- --configuration development

cd ../backend/ProMantenimiento
SPRING_DATASOURCE_PASSWORD=pms276_test \
  bash mvnw -Dmaven.repo.local=/tmp/pms276-m2 -DskipTests compile
SPRING_DATASOURCE_PASSWORD=pms276_test \
  FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
  bash mvnw -Dmaven.repo.local=/tmp/pms276-m2 test
```

La compilación de producción Angular puede requerir acceso de red para inlining de Google Fonts; la configuración `development` no depende de esa descarga.
Los tests Karma requieren un navegador Chrome/Chromium disponible y `CHROME_BIN` cuando no está en el PATH.

No se incluyen usuarios de demo en el script general ni se reutilizan UID del proyecto compartido.

## Integración y recuperación

El frontend general usa API en 8086, como el backend del PR. Para una demo visual contra el emulador, usar el backend aislado en 8086 (puerto libre) y definir `globalThis.PMS276 = { useFirebaseEmulator: true }` antes de cargar Angular en un entorno de prueba local. El frontend habitual no modifica su proyecto Firebase por activar el backend de pruebas. El smoke puede dirigirse al puerto elegido mediante `PMS276_BASE_URL`.

El alta termina su transacción MySQL antes de responder. Un fallo durante `save` o durante `commit` intenta eliminar la identidad Firebase creada. Si la eliminación también falla, se conserva el error original con la causa de compensación y se registra `RECUPERACION_ALTA_RESIDENTE_PENDIENTE` con el UID. Recuperación: identificar ese UID en el log, verificar que no exista perfil MySQL válido asociado y reintentar la eliminación mediante Firebase Admin del proyecto configurado; si existe un perfil válido, investigar antes de eliminar. No registrar contraseñas ni tokens.

## Validación posterior del 24/11/2026

Erick ejecutó el flujo manual en el clon oficial, con la configuración habitual del proyecto. Se verificaron alta y persistencia de propietario e inquilino; acceso del propietario y reconocimiento de su unidad mediante una incidencia; duplicado 409; unidad inexistente 404; y rechazo 403 a un residente por API.

La suite `AdminUsuarioServiceTest` se ejecutó mediante Maven: 5 pruebas aprobadas. La regresión `AlertaInternaPropiedadTest` aprobó otros 3 casos con Maven y un agente de prueba explícito en el entorno del asistente. La simulación de fallos no acredita una caída real de infraestructura. No se atribuyen con estos resultados Karma, build de producción ni aceptación integral de la DoD.

Detalle, límites y registro para Anexo A: [validación de PMS-276](qa/PMS-276-validacion-2026-11-24.md). Las nueve capturas están adjuntas en [PMS-276](https://gean-team-isil.atlassian.net/browse/PMS-276).

## Conciliación de aceptación

La validación satisfactoria del grupo fue comunicada por Erick. Se contrastaron los seis criterios con las evidencias manuales y Maven disponibles y la DoD documentada; el registro de validación detalla ese contraste y conserva sus límites. El estado administrativo vigente se consulta en PMS-276. No se atribuye una nueva ejecución ni un despliegue externo.
