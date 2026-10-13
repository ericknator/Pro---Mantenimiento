package pe.com.promantenimineto.repository;

import pe.com.promantenimineto.entity.UsuarioUnidadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UsuarioUnidadRepository
        extends JpaRepository<UsuarioUnidadEntity, Long> {

    @Query("SELECT uu FROM UsuarioUnidadEntity uu WHERE uu.activo = true")
    List<UsuarioUnidadEntity> findAllCustom();

    @Query("""
        SELECT COUNT(uu) > 0
        FROM UsuarioUnidadEntity uu
        WHERE uu.usuario.id = :usuarioId
          AND uu.unidad.id = :unidadId
          AND uu.activo = true
        """)
    boolean existeRelacionActiva(
        @Param("usuarioId") Long usuarioId,
        @Param("unidadId") Long unidadId
    );
}