#!/usr/bin/env bash
set -euo pipefail

if command -v mysql >/dev/null 2>&1; then
  exec mysql "$@"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo 'Instala mysql-client o Docker para ejecutar las validaciones.' >&2
  exit 1
fi

args=()
for argumento in "$@"; do
  if [[ "$argumento" == '--port=3310' ]]; then
    args+=(--port=3306)
  else
    args+=("$argumento")
  fi
done

exec docker exec -i -e "MYSQL_PWD=${MYSQL_PWD:-}" pms276-mysql mysql "${args[@]}"
