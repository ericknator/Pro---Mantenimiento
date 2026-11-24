#!/usr/bin/env bash
# Valida la migración en una copia nueva. Nunca aplica ALTER/UPDATE sobre la base origen.
set -euo pipefail
umask 077
recursos=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
proyecto=${1:-$recursos}
config="$proyecto/backend/ProMantenimiento/src/main/resources/application.properties"
migracion="$recursos/database/scripts/04_PMS272_relacion_incidencia_activo.sql"
verificacion="$recursos/scripts/pms272-test/verify-relations.sql"
for archivo in "$config" "$migracion" "$verificacion"; do
  [[ -f "$archivo" ]] || { echo "Falta el archivo: $archivo" >&2; exit 1; }
done
cliente=$(command -v mysql || true)
dump=$(command -v mysqldump || true)
[[ -n "$cliente" ]] || cliente=/usr/lib/mysql-workbench/mysql
[[ -n "$dump" ]] || dump=/usr/lib/mysql-workbench/mysqldump
[[ -x "$cliente" && -x "$dump" ]] || {
  echo 'No se encontraron mysql y mysqldump. Instala el cliente MySQL para continuar.' >&2; exit 1;
}
temporal=$(mktemp -d /tmp/pms272-mysql.XXXXXX)
trap 'rm -rf -- "$temporal"' EXIT
python3 - "$config" "$temporal" <<'PY'
from pathlib import Path
from urllib.parse import urlparse
import re,sys
valores={}
for linea in Path(sys.argv[1]).read_text().splitlines():
 if not linea.strip() or linea.lstrip().startswith('#') or '=' not in linea: continue
 k,v=linea.split('=',1); valores[k.strip()]=v.strip()
url=valores['spring.datasource.url']
if not url.startswith('jdbc:mysql://'): raise SystemExit('Se requiere una URL JDBC MySQL literal.')
u=urlparse(url.removeprefix('jdbc:'))
base=u.path.removeprefix('/')
if u.hostname not in ('localhost','127.0.0.1','::1') or not re.fullmatch(r'[A-Za-z0-9_]+',base):
 raise SystemExit('La validación solo admite MySQL local y un nombre de base simple.')
def quoted(v):
 if '${' in v or '\n' in v or '\r' in v: raise SystemExit('Se requieren valores locales literales en application.properties.')
 return '"'+v.replace('\\','\\\\').replace('"','\\"')+'"'
p=Path(sys.argv[2])
p.joinpath('client.cnf').write_text('[client]\nhost='+quoted(u.hostname)+'\nport='+str(u.port or 3306)+'\nuser='+quoted(valores['spring.datasource.username'])+'\npassword='+quoted(valores['spring.datasource.password'])+'\n')
p.joinpath('source').write_text(base)
PY
origen=$(cat "$temporal/source")
copia="pms272_qa_$(date +%Y%m%d_%H%M%S)_${RANDOM}"
[[ "$copia" == pms272_qa_* && "$copia" != "$origen" ]] || exit 1
db() { env -u MYSQL_PWD "$cliente" --defaults-extra-file="$temporal/client.cnf" --protocol=TCP --batch --skip-column-names "$@"; }
printf 'Conectando a MySQL local; origen de solo lectura: %s\n' "$origen"
db "$origen" -e 'SELECT VERSION();'
columnas=$(db "$origen" -e "SET SESSION group_concat_max_len=65535; SELECT GROUP_CONCAT(CONCAT(CHAR(96),COLUMN_NAME,CHAR(96)) ORDER BY ORDINAL_POSITION) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='incidencia';")
[[ -n "$columnas" && "$columnas" != NULL ]] || { echo 'No se encontró incidencia.' >&2; exit 1; }
db "$origen" -e "SELECT $columnas FROM incidencia ORDER BY id" > "$temporal/incidencia-original.tsv"
conteos=$(db "$origen" -e 'SELECT (SELECT COUNT(*) FROM incidencia),(SELECT COUNT(*) FROM activo),(SELECT COUNT(*) FROM usuario_perfil);')
env -u MYSQL_PWD "$dump" --defaults-extra-file="$temporal/client.cnf" --protocol=TCP \
  --single-transaction --skip-lock-tables --no-tablespaces --set-gtid-purged=OFF \
  --column-statistics=0 --skip-triggers "$origen" > "$temporal/copia.sql"
db -e "CREATE DATABASE \`$copia\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
printf 'Copia de tablas/datos creada: %s (se conserva para la siguiente validación)\n' "$copia"
db "$copia" < "$temporal/copia.sql"
[[ "$(db "$copia" -e 'SELECT (SELECT COUNT(*) FROM incidencia),(SELECT COUNT(*) FROM activo),(SELECT COUNT(*) FROM usuario_perfil);')" == "$conteos" ]] || {
  echo 'No coinciden los conteos. Detener las escrituras de la app y repetir en una copia nueva.' >&2; exit 1;
}
for pasada in 1 2; do
  db "$copia" < "$migracion" > "$temporal/migracion-$pasada.txt"
  printf 'Migración pasada %s: OK\n' "$pasada"
done
db "$copia" -e "SELECT $columnas FROM incidencia ORDER BY id" > "$temporal/incidencia-copia.tsv"
cmp -s "$temporal/incidencia-original.tsv" "$temporal/incidencia-copia.tsv" || {
  echo 'Las filas de incidencia no coinciden con la lectura inicial; revisar antes de continuar.' >&2; exit 1;
}
printf 'Filas y columnas originales de incidencia preservadas: OK\n'
[[ "$(db "$copia" -e "SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='incidencia' AND COLUMN_NAME='activo_id' AND REFERENCED_TABLE_NAME='activo' AND REFERENCED_COLUMN_NAME='id';")" == 1 ]] || {
  echo 'No se confirmó la FK de incidencia.activo_id.' >&2; exit 1;
}
db "$copia" < "$verificacion"
db "$copia" -e "SELECT $columnas FROM incidencia ORDER BY id" > "$temporal/incidencia-final.tsv"
cmp -s "$temporal/incidencia-original.tsv" "$temporal/incidencia-final.tsv" || {
  echo 'Las filas de incidencia cambiaron después del rollback de QA.' >&2; exit 1;
}
[[ "$(db "$copia" -e 'SELECT (SELECT COUNT(*) FROM incidencia),(SELECT COUNT(*) FROM activo),(SELECT COUNT(*) FROM usuario_perfil);')" == "$conteos" ]] || {
  echo 'No coinciden los conteos después del rollback.' >&2; exit 1;
}
printf 'VALIDACIÓN MYSQL COMPLETADA. Base de prueba: %s\n' "$copia"
printf 'Pendiente: servicio HTTP, auditoría, permisos Firebase y navegador contra esta copia.\n'
