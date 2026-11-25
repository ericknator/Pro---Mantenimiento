-- Solo para la copia temporal creada por validate-mysql-copy.sh.
-- Los registros QA son sintéticos y la transacción se revierte al terminar.
CREATE TEMPORARY TABLE pms272_assertions (
  caso VARCHAR(120), pasa TINYINT NOT NULL CHECK (pasa = 1)
);
START TRANSACTION;
INSERT INTO activo (codigo, tipo_activo_id, estado_activo_id, nombre, ubicacion)
SELECT 'QA-PMS272-A', t.id, e.id, 'Equipo sintético PMS272', 'QA aislado A'
FROM tipo_activo t CROSS JOIN estado_activo e WHERE t.activo=1 AND e.activo=1 LIMIT 1;
SET @pms272_a = LAST_INSERT_ID();
INSERT INTO activo (codigo, tipo_activo_id, estado_activo_id, nombre, ubicacion)
SELECT 'QA-PMS272-B', tipo_activo_id, estado_activo_id, nombre, 'QA aislado B'
FROM activo WHERE id=@pms272_a;
SET @pms272_b = LAST_INSERT_ID();
INSERT INTO pms272_assertions SELECT 'Dos activos distintos del mismo tipo',
  COUNT(*)=2 AND COUNT(DISTINCT tipo_activo_id)=1
FROM activo WHERE codigo IN ('QA-PMS272-A','QA-PMS272-B');

INSERT INTO incidencia (codigo, solicitante_id, categoria_id, prioridad_id, estado_id, ubicacion, descripcion)
SELECT 'QA-PMS272-RELACION', u.id, c.id, p.id, e.id, 'QA aislado',
  'Dato sintético para validar la migración; se revierte al finalizar.'
FROM usuario_perfil u CROSS JOIN categoria_incidencia c
CROSS JOIN prioridad_incidencia p CROSS JOIN estado_incidencia e
WHERE u.activo=1 AND c.activo=1 AND p.activo=1 AND e.codigo='REPORTADA' LIMIT 1;
SET @pms272_inc = LAST_INSERT_ID();
INSERT INTO pms272_assertions SELECT 'Incidencia QA creada sin vínculo', COUNT(*)=1
FROM incidencia WHERE id=@pms272_inc AND codigo='QA-PMS272-RELACION' AND activo_id IS NULL;

UPDATE incidencia SET activo_id=@pms272_a WHERE id=@pms272_inc;
INSERT INTO pms272_assertions SELECT 'Vínculo persistido al activo A', COUNT(*)=1
FROM incidencia i JOIN activo a ON a.id=i.activo_id
WHERE i.id=@pms272_inc AND a.codigo='QA-PMS272-A';
INSERT INTO pms272_assertions SELECT 'No aparece en el activo B', COUNT(*)=0
FROM incidencia WHERE id=@pms272_inc AND activo_id=@pms272_b;

UPDATE incidencia SET activo_id=@pms272_b WHERE id=@pms272_inc;
INSERT INTO pms272_assertions SELECT 'Cambio persistido al activo B', COUNT(*)=1
FROM incidencia WHERE id=@pms272_inc AND activo_id=@pms272_b;
INSERT INTO pms272_assertions SELECT 'Ya no pertenece al activo A', COUNT(*)=0
FROM incidencia WHERE id=@pms272_inc AND activo_id=@pms272_a;

UPDATE incidencia SET activo_id=NULL WHERE id=@pms272_inc;
INSERT INTO pms272_assertions SELECT 'Retirada del vínculo sin cambiar estado', COUNT(*)=1
FROM incidencia i JOIN estado_incidencia e ON e.id=i.estado_id
WHERE i.id=@pms272_inc AND i.activo_id IS NULL AND e.codigo='REPORTADA';
SELECT caso, 'OK' AS resultado FROM pms272_assertions;
ROLLBACK;
SELECT 'Registros QA revertidos' AS caso, IF(COUNT(*)=0,'OK','ERROR') AS resultado
FROM activo WHERE codigo IN ('QA-PMS272-A','QA-PMS272-B');
