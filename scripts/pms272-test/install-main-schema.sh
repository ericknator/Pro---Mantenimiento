#!/usr/bin/env bash
# Respalda la base local principal antes de aplicar la migración incremental PMS-272.
set -euo pipefail
umask 077
repo=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
config="$repo/backend/ProMantenimiento/src/main/resources/application.properties"
migracion="$repo/database/scripts/04_PMS272_relacion_incidencia_activo.sql"
[[ -f "$config" && -f "$migracion" ]] || { echo 'Falta configuración o migración.' >&2; exit 1; }
cliente=$(command -v mysql || true)
dump=$(command -v mysqldump || true)
[[ -n "$cliente" ]] || cliente=/usr/lib/mysql-workbench/mysql
[[ -n "$dump" ]] || dump=/usr/lib/mysql-workbench/mysqldump
[[ -x "$cliente" && -x "$dump" ]] || { echo 'Se requieren mysql y mysqldump.' >&2; exit 1; }
temporal=$(mktemp -d /tmp/pms272-instalar.XXXXXX)
trap 'rm -rf -- "$temporal"' EXIT
python3 - "$config" "$temporal" <<'PY'
from pathlib import Path
from urllib.parse import urlparse
import sys
valores={}
for linea in Path(sys.argv[1]).read_text().splitlines():
 if not linea.strip() or linea.lstrip().startswith('#') or '=' not in linea: continue
 k,v=linea.split('=',1); valores[k.strip()]=v.strip()
url=valores['spring.datasource.url']
if not url.startswith('jdbc:mysql://'): raise SystemExit('Se requiere una URL JDBC MySQL literal.')
u=urlparse(url.removeprefix('jdbc:'))
base=u.path.removeprefix('/')
if u.hostname not in ('localhost','127.0.0.1','::1') or base!='bdpromantenimiento20262':
 raise SystemExit('Este instalador solo admite la base principal local bdpromantenimiento20262.')
def quoted(v):
 if '${' in v or '\n' in v or '\r' in v: raise SystemExit('Se requieren valores locales literales.')
 return '"'+v.replace('\\','\\\\').replace('"','\\"')+'"'
p=Path(sys.argv[2])
p.joinpath('client.cnf').write_text('[client]\nhost='+quoted(u.hostname)+'\nport='+str(u.port or 3306)+'\nuser='+quoted(valores['spring.datasource.username'])+'\npassword='+quoted(valores['spring.datasource.password'])+'\n')
p.joinpath('database').write_text(base)
PY
base=$(cat "$temporal/database")
db() { env -u MYSQL_PWD "$cliente" --defaults-extra-file="$temporal/client.cnf" --protocol=TCP --batch --skip-column-names "$@"; }
printf 'Base principal seleccionada: %s\n' "$base"
db "$base" -e 'SELECT VERSION();'
columnas=$(db "$base" -e "SET SESSION group_concat_max_len=65535; SELECT GROUP_CONCAT(CONCAT(CHAR(96),COLUMN_NAME,CHAR(96)) ORDER BY ORDINAL_POSITION) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='incidencia';")
[[ -n "$columnas" && "$columnas" != NULL ]] || { echo 'No se encontró incidencia.' >&2; exit 1; }
db "$base" -e "SELECT $columnas FROM incidencia ORDER BY id" > "$temporal/incidencias-antes.tsv"
conteos=$(db "$base" -e 'SELECT (SELECT COUNT(*) FROM incidencia),(SELECT COUNT(*) FROM activo),(SELECT COUNT(*) FROM usuario_perfil);')
respaldo_raiz="${XDG_STATE_HOME:-$HOME/.local/state}/pro-mantenimiento/backups"
mkdir -p -- "$respaldo_raiz"
respaldo=$(mktemp -d "$respaldo_raiz/pms272-$(date +%Y%m%d_%H%M%S).XXXXXX")
env -u MYSQL_PWD "$dump" --defaults-extra-file="$temporal/client.cnf" --protocol=TCP \
  --single-transaction --skip-lock-tables --no-tablespaces --set-gtid-purged=OFF \
  --column-statistics=0 --hex-blob --routines --triggers --events --databases "$base" \
  > "$respaldo/base-principal.sql"
[[ -s "$respaldo/base-principal.sql" ]] || { echo 'Respaldo vacío: migración detenida.' >&2; exit 1; }
gzip "$respaldo/base-principal.sql"
gzip -t "$respaldo/base-principal.sql.gz"
(cd -- "$respaldo" && sha256sum base-principal.sql.gz > SHA256SUMS && sha256sum -c SHA256SUMS)
printf 'Respaldo conservado en: %s\n' "$respaldo"
printf 'Incidencias, activos y perfiles antes: %s\n' "$conteos"
sha256sum "$migracion" > "$respaldo/migracion.sha256"
db "$base" < "$migracion" > "$respaldo/migracion-resultado.txt"
db "$base" -e "SELECT $columnas FROM incidencia ORDER BY id" > "$temporal/incidencias-despues.tsv"
cmp -s "$temporal/incidencias-antes.tsv" "$temporal/incidencias-despues.tsv" || {
  echo "Revisar diferencias en incidencias. Respaldo disponible en $respaldo" >&2; exit 1;
}
[[ "$(db "$base" -e 'SELECT (SELECT COUNT(*) FROM incidencia),(SELECT COUNT(*) FROM activo),(SELECT COUNT(*) FROM usuario_perfil);')" == "$conteos" ]] || {
  echo "Los conteos cambiaron. Revisar antes de iniciar el backend. Respaldo: $respaldo" >&2; exit 1;
}
[[ "$(db "$base" -e "SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='incidencia' AND COLUMN_NAME='activo_id' AND IS_NULLABLE='YES';")" == 1 ]] || {
  echo 'No se confirmó activo_id nullable.' >&2; exit 1;
}
[[ "$(db "$base" -e "SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='incidencia' AND COLUMN_NAME='activo_id' AND REFERENCED_TABLE_NAME='activo' AND REFERENCED_COLUMN_NAME='id';")" == 1 ]] || {
  echo 'No se confirmó la relación con activo.id.' >&2; exit 1;
}
printf 'MIGRACIÓN PRINCIPAL COMPLETADA: filas originales preservadas, columna y FK verificadas.\n'
printf 'Respaldo: %s/base-principal.sql.gz\n' "$respaldo"
printf 'Pendiente: iniciar el backend con su configuración habitual y verificar la aplicación.\n'
