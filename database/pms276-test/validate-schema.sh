#!/usr/bin/env bash
set -euo pipefail

DB_NAME='bdpromantenimiento_pms276_test'
MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3310}"
MYSQL_USER="${MYSQL_USER:-pms276}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-pms276_test}"
MYSQL_CLIENT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/mysql-client.sh"
EXPECTED_USERS="${PMS276_EXPECT_USERS:-0}"
export MYSQL_PWD="$MYSQL_PASSWORD"

[[ "$DB_NAME" == 'bdpromantenimiento_pms276_test' ]] || exit 1

resultado="$("$MYSQL_CLIENT" --protocol=tcp --host="$MYSQL_HOST" --port="$MYSQL_PORT" --user="$MYSQL_USER" \
  --database="$DB_NAME" --batch --skip-column-names --execute="
    SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';
    SELECT COUNT(*) FROM rol WHERE codigo IN ('ADMINISTRADOR','RESIDENTE');
    SELECT COUNT(*) FROM unidad_residencial WHERE activo = 1;
    SELECT COUNT(*) FROM usuario_perfil;
    SELECT COUNT(*) FROM usuario_perfil u JOIN rol r ON r.id = u.rol_id
      WHERE u.correo = 'admin.pms276@example.test' AND r.codigo = 'ADMINISTRADOR';
  ")"

mapfile -t valores <<< "$resultado"
[[ "${valores[0]}" == '51' ]] || { echo "Se esperaban 51 tablas, se obtuvieron ${valores[0]}" >&2; exit 1; }
[[ "${valores[1]}" == '2' ]] || { echo 'Faltan roles base en la base aislada.' >&2; exit 1; }
(( valores[2] > 0 )) || { echo 'No hay unidades activas para probar el alta.' >&2; exit 1; }
[[ "${valores[3]}" == "$EXPECTED_USERS" ]] || {
  echo "Se esperaban $EXPECTED_USERS usuarios aislados, se obtuvieron ${valores[3]}" >&2
  exit 1
}
if [[ "$EXPECTED_USERS" == '0' ]]; then
  [[ "${valores[4]}" == '0' ]] || { echo 'La preparación no debe insertar usuarios de prueba.' >&2; exit 1; }
else
  [[ "${valores[4]}" == '1' ]] || { echo 'Debe existir exactamente un administrador aislado.' >&2; exit 1; }
fi

echo "Validación OK: $DB_NAME, tablas=${valores[0]}, unidades=${valores[2]}, usuarios=${valores[3]}"
