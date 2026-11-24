-- PMS-272: ejecutar sobre la base seleccionada ANTES de iniciar el backend de esta rama.
-- Incremental: conserva las filas y deja activo_id NULL en incidencias sin asociación.
-- El tipo se toma del ID real de activo para respetar su signo/tamaño.
-- Si no hay base seleccionada o no existe activo.id, PREPARE falla antes de modificar.
SET @pms272_tipo_id = (
  SELECT COLUMN_TYPE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'activo' AND COLUMN_NAME = 'id'
);
SET @pms272_existe_columna = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'incidencia' AND COLUMN_NAME = 'activo_id'
);
SET @pms272_sql = IF(@pms272_existe_columna > 0, 'SELECT 1',
  CONCAT('ALTER TABLE incidencia ADD COLUMN activo_id ', @pms272_tipo_id, ' NULL'));
PREPARE pms272_stmt FROM @pms272_sql;
EXECUTE pms272_stmt;
DEALLOCATE PREPARE pms272_stmt;

SET @pms272_existe_fk = (
  SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'incidencia' AND COLUMN_NAME = 'activo_id'
    AND REFERENCED_TABLE_NAME = 'activo' AND REFERENCED_COLUMN_NAME = 'id'
);
SET @pms272_sql = IF(@pms272_existe_fk > 0, 'SELECT 1',
  'ALTER TABLE incidencia ADD CONSTRAINT fk_incidencia_activo FOREIGN KEY (activo_id) REFERENCES activo(id) ON DELETE RESTRICT ON UPDATE RESTRICT');
PREPARE pms272_stmt FROM @pms272_sql;
EXECUTE pms272_stmt;
DEALLOCATE PREPARE pms272_stmt;

SELECT i.codigo, i.activo_id, a.codigo AS codigo_activo
FROM incidencia i LEFT JOIN activo a ON a.id = i.activo_id ORDER BY i.id;
