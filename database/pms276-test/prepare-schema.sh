#!/usr/bin/env bash
set -euo pipefail

DB_NAME='bdpromantenimiento_pms276_test'
SCHEMA_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/scripts/02_ProMantenimiento_BD_V4_CORREGIDA_RELACIONES.sql"
MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3310}"
MYSQL_USER="${MYSQL_USER:-pms276}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-pms276_test}"
MYSQL_CLIENT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/mysql-client.sh"
COMPATIBILITY_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/hibernate-compatibility.sql"

if [[ ! -f "$SCHEMA_FILE" ]]; then
  echo "No se encontró el script base: $SCHEMA_FILE" >&2
  exit 1
fi

if [[ ! -f "$COMPATIBILITY_FILE" ]]; then
  echo "No se encontró el complemento de compatibilidad: $COMPATIBILITY_FILE" >&2
  exit 1
fi

if [[ "$DB_NAME" != 'bdpromantenimiento_pms276_test' ]]; then
  echo 'Protección: el script solo puede operar sobre bdpromantenimiento_pms276_test.' >&2
  exit 1
fi

export MYSQL_PWD="$MYSQL_PASSWORD"

# El script V4 es la fuente de estructura, catálogos y unidades. Se renombra la
# base exclusivamente en el flujo aislado y se omiten los perfiles/relaciones
# de demo históricos, cuyos UID pertenecen a otro proyecto Firebase.
sed "s/bdpromantenimiento20262/$DB_NAME/g" "$SCHEMA_FILE" \
  | awk '
      /^INSERT INTO usuario_perfil[[:space:]]/ { modo="perfil"; next }
      modo == "perfil" && /^INSERT INTO unidad_residencial[[:space:]]/ { modo="normal"; print; next }
      modo == "perfil" { next }
      /^INSERT INTO usuario_unidad[[:space:]]/ { modo="relacion"; next }
      modo == "relacion" && /^-- ============================================================$/ { modo="normal"; print; next }
      modo == "relacion" { next }
      { print }
    ' \
  | "$MYSQL_CLIENT" --protocol=tcp --host="$MYSQL_HOST" --port="$MYSQL_PORT" --user="$MYSQL_USER"

# Completa únicamente las tablas requeridas por las entidades JPA actuales que
# aún no están incluidas en el DDL V4 histórico.
"$MYSQL_CLIENT" --protocol=tcp --host="$MYSQL_HOST" --port="$MYSQL_PORT" --user="$MYSQL_USER" \
  --database="$DB_NAME" < "$COMPATIBILITY_FILE"

echo "Base aislada preparada: $DB_NAME"
"$MYSQL_CLIENT" --protocol=tcp --host="$MYSQL_HOST" --port="$MYSQL_PORT" --user="$MYSQL_USER" \
  --database="$DB_NAME" --batch --skip-column-names \
  --execute="SELECT CONCAT('tablas=', COUNT(*)) FROM information_schema.tables WHERE table_schema = '$DB_NAME'; SELECT CONCAT('usuarios=', COUNT(*)) FROM usuario_perfil;"
