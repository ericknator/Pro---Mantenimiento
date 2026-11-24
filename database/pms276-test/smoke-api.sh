#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${PMS276_BASE_URL:-http://127.0.0.1:8086/promantenimiento}"
EMULATOR_HOST="${FIREBASE_AUTH_EMULATOR_HOST:-127.0.0.1:9099}"
ADMIN_EMAIL="${PMS276_ADMIN_EMAIL:-admin.pms276@example.test}"
ADMIN_PASSWORD="${PMS276_ADMIN_PASSWORD:-Pms276-Test-Admin-123}"
SMOKE_SUFFIX="${PMS276_SMOKE_SUFFIX:-$(date +%s)}"
SMOKE_PASSWORD="${PMS276_SMOKE_PASSWORD:-Pms276-Smoke-123}"
AUTH_URL="http://$EMULATOR_HOST/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-api-key"

[[ "$EMULATOR_HOST" == '127.0.0.1:9099' || "$EMULATOR_HOST" == 'localhost:9099' ]] || {
  echo 'Protección: smoke-api.sh solo acepta Firebase Auth Emulator en 9099.' >&2
  exit 1
}

token_for() {
  local email="$1"
  local password="$2"
  local login_payload
  login_payload="$(printf '{"email":"%s","password":"%s","returnSecureToken":true}' "$email" "$password")"
  curl -fsS -X POST -H 'Content-Type: application/json' -d "$login_payload" "$AUTH_URL" \
    | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.parse(s).idToken))'
}

admin_token="$(token_for "$ADMIN_EMAIL" "$ADMIN_PASSWORD")"
unauth_code="$(curl -sS -o /dev/null -w '%{http_code}' "$BASE_URL/api/admin/usuarios")"
[[ "$unauth_code" == '401' ]] || { echo "Se esperaba 401 sin token, se obtuvo $unauth_code" >&2; exit 1; }

units_json="$(curl -fsS -H "Authorization: Bearer $admin_token" "$BASE_URL/api/admin/usuarios/unidades")"
unit_id="$(printf '%s' "$units_json" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const x=JSON.parse(s);if(!x.length)process.exit(1);process.stdout.write(String(x[0].id))})')"

create_user() {
  local email="$1"
  local relation="$2"
  local first_name="$3"
  local payload
  payload="$(printf '{"nombres":"%s","apellidos":"PMS276 Smoke","correo":"%s","telefono":"","claveTemporal":"%s","unidadId":%s,"relacion":"%s"}' "$first_name" "$email" "$SMOKE_PASSWORD" "$unit_id" "$relation")"
  curl -sS -w '\n%{http_code}' -X POST \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $admin_token" \
    -d "$payload" "$BASE_URL/api/admin/usuarios"
}

owner_email="pms276-owner-${SMOKE_SUFFIX}@example.test"
tenant_email="pms276-tenant-${SMOKE_SUFFIX}@example.test"
owner_result="$(create_user "$owner_email" 'PROPIETARIO' 'Propietario')"
owner_code="${owner_result##*$'\n'}"
[[ "$owner_code" == '201' ]] || { echo "Alta de propietario falló ($owner_code): ${owner_result%$'\n'*}" >&2; exit 1; }

tenant_result="$(create_user "$tenant_email" 'INQUILINO' 'Inquilino')"
tenant_code="${tenant_result##*$'\n'}"
[[ "$tenant_code" == '201' ]] || { echo "Alta de inquilino falló ($tenant_code): ${tenant_result%$'\n'*}" >&2; exit 1; }

tenant_token="$(token_for "$tenant_email" "$SMOKE_PASSWORD")"
resident_admin_code="$(curl -sS -o /dev/null -w '%{http_code}' \
  -H "Authorization: Bearer $tenant_token" "$BASE_URL/api/admin/usuarios")"
[[ "$resident_admin_code" == '403' ]] || {
  echo "Se esperaba 403 para residente, se obtuvo $resident_admin_code" >&2
  exit 1
}

users_json="$(curl -fsS -H "Authorization: Bearer $admin_token" "$BASE_URL/api/admin/usuarios")"
summary="$(printf '%s' "$users_json" | node -e '
  let s="";
  process.stdin.on("data",d=>s+=d).on("end",()=>{
    const users=JSON.parse(s);
    const owner=users.find(u=>u.correo===process.argv[1]);
    const tenant=users.find(u=>u.correo===process.argv[2]);
    if (!owner || owner.unidades?.[0]?.relacion!=="PROPIETARIO" || !tenant || tenant.unidades?.[0]?.relacion!=="INQUILINO") process.exit(1);
    process.stdout.write(`${users.length}|${owner.unidades[0].etiqueta}|${tenant.unidades[0].etiqueta}`);
  })' "$owner_email" "$tenant_email")"

printf 'Smoke API OK: 401=%s, unidades=%s, altas=201/201, residente=403, usuarios=%s\n' \
  "$unauth_code" "$(printf '%s' "$units_json" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(String(JSON.parse(s).length)))')" "$summary"
