#!/usr/bin/env bash
set -euo pipefail

DB_NAME='bdpromantenimiento_pms276_test'
EMULATOR_HOST="${FIREBASE_AUTH_EMULATOR_HOST:-127.0.0.1:9099}"
PROJECT_ID="${FIREBASE_PROJECT_ID:-demo-pms276}"
EMAIL="${PMS276_ADMIN_EMAIL:-admin.pms276@example.test}"
PASSWORD="${PMS276_ADMIN_PASSWORD:-Pms276-Test-Admin-123}"
MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3310}"
MYSQL_USER="${MYSQL_USER:-pms276}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-pms276_test}"
MYSQL_CLIENT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/mysql-client.sh"

[[ "$EMULATOR_HOST" == '127.0.0.1:9099' || "$EMULATOR_HOST" == 'localhost:9099' ]] || {
  echo 'Protección: seed-admin.sh solo acepta Firebase Auth Emulator en 9099.' >&2
  exit 1
}

export MYSQL_PWD="$MYSQL_PASSWORD"
AUTH_URL="http://$EMULATOR_HOST/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key"
LOGIN_URL="http://$EMULATOR_HOST/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key"
payload="$(printf '{"email":"%s","password":"%s","returnSecureToken":true}' "$EMAIL" "$PASSWORD")"

respuesta="$(curl -sS -X POST -H 'Content-Type: application/json' -d "$payload" "$AUTH_URL" || true)"
uid="$(printf '%s' "$respuesta" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).localId||"")}catch{}})')"

if [[ -z "$uid" ]]; then
  respuesta="$(curl -fsS -X POST -H 'Content-Type: application/json' -d "$payload" "$LOGIN_URL")"
  uid="$(printf '%s' "$respuesta" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(JSON.parse(s).localId||"")}catch{}})')"
fi

[[ -n "$uid" ]] || { echo 'No se pudo crear o recuperar el administrador del emulador.' >&2; exit 1; }

"$MYSQL_CLIENT" --protocol=tcp --host="$MYSQL_HOST" --port="$MYSQL_PORT" --user="$MYSQL_USER" \
  --database="$DB_NAME" --execute="
    INSERT INTO usuario_perfil
      (firebase_uid, rol_id, nombres, apellidos, correo, activo)
    SELECT '$uid', r.id, 'Administrador', 'PMS-276', '$EMAIL', 1
    FROM rol r
    WHERE r.codigo = 'ADMINISTRADOR'
      AND NOT EXISTS (SELECT 1 FROM usuario_perfil u WHERE u.correo = '$EMAIL');
  "

echo "Administrador aislado listo: $EMAIL (proyecto=$PROJECT_ID, emulator=$EMULATOR_HOST)"
