package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import pe.com.promantenimineto.entity.ActivoEntity;
import pe.com.promantenimineto.projection.HistorialActivoProjection;

@Repository
public interface HistorialActivoRepository extends JpaRepository<ActivoEntity, Long> {

    @Query(value = """
        SELECT
            historial.tipo AS tipo,
            historial.registro_id AS registroId,
            historial.codigo AS codigo,
            historial.codigo_activo AS codigoActivo,
            historial.activo_nombre AS activoNombre,
            historial.titulo AS titulo,
            historial.descripcion AS descripcion,
            historial.categoria AS categoria,
            historial.estado AS estado,
            historial.fecha AS fecha
        FROM (
            SELECT
                'MANTENIMIENTO' AS tipo,
                ip.id AS registro_id,
                NULL AS codigo,
                a.codigo AS codigo_activo,
                a.nombre AS activo_nombre,
                tp.titulo AS titulo,
                ip.acciones_realizadas AS descripcion,
                'Mantenimiento preventivo' AS categoria,
                'Ejecutado' AS estado,
                ip.ejecutado_en AS fecha
            FROM intervencion_preventiva ip
            INNER JOIN tarea_preventiva tp
                ON tp.id = ip.tarea_preventiva_id
            INNER JOIN activo a
                ON a.id = tp.activo_id

            UNION ALL

            SELECT
                'INCIDENCIA' AS tipo,
                i.id AS registro_id,
                i.codigo AS codigo,
                NULL AS codigo_activo,
                NULL AS activo_nombre,
                i.descripcion AS titulo,
                i.descripcion AS descripcion,
                ci.nombre AS categoria,
                ei.nombre AS estado,
                i.fecha_reporte AS fecha
            FROM incidencia i
            INNER JOIN categoria_incidencia ci
                ON ci.id = i.categoria_id
            INNER JOIN estado_incidencia ei
                ON ei.id = i.estado_id
        ) AS historial
        ORDER BY historial.fecha DESC
        """, nativeQuery = true)
    List<HistorialActivoProjection> listarHistorial();
}
