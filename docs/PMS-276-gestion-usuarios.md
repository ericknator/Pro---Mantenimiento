# PMS-276 — Gestión de usuarios

Esta rama usa un entorno local aislado. No debe apuntar a `bdpromantenimiento20262` ni al proyecto Firebase compartido.

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
   SPRING_DATASOURCE_PASSWORD=pms276_test \
     FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 bash mvnw spring-boot:run

   cd frontend
   npm start
   ```

El backend queda en `http://localhost:8086/promantenimiento` y usa por defecto `bdpromantenimiento_pms276_test` en `localhost:3310`.

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
