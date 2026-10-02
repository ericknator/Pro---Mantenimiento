package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.UsuarioPerfilEntity;

public interface UsuarioPerfilRepository extends JpaRepository<UsuarioPerfilEntity, Long> {

    @Query("select d from UsuarioPerfilEntity d where d.activo=true")
    List<UsuarioPerfilEntity> findAllCustom();

}