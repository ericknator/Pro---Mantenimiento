package pe.com.promantenimineto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.EntityGraph;

import pe.com.promantenimineto.entity.UsuarioPerfilEntity;

public interface UsuarioPerfilRepository extends JpaRepository<UsuarioPerfilEntity, Long> {

    @Query("select d from UsuarioPerfilEntity d where d.activo=true")
    List<UsuarioPerfilEntity> findAllCustom();
    
    @EntityGraph(attributePaths = {"rol"})
    Optional<UsuarioPerfilEntity> findByFirebaseUid(String firebaseUid);

    @EntityGraph(attributePaths = {"rol"})
    List<UsuarioPerfilEntity> findAllByOrderByApellidosAscNombresAsc();

    Optional<UsuarioPerfilEntity> findByCorreoIgnoreCase(String correo);

    boolean existsByCorreoIgnoreCase(String correo);

    boolean existsByFirebaseUid(String firebaseUid);
    
    @EntityGraph(attributePaths = {"rol"})
    List<UsuarioPerfilEntity> findByActivoTrueAndRol_IdAndRol_ActivoTrueOrderByNombresAsc(
        Long rolId
    );

}
