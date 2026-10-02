package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.UsuarioUnidadEntity;

public interface UsuarioUnidadRepository extends JpaRepository<UsuarioUnidadEntity, Long> {

    @Query("select d from UsuarioUnidadEntity d where d.activo=true")
    List<UsuarioUnidadEntity> findAllCustom();

}