package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.PermisoEntity;

public interface PermisoRepository extends JpaRepository<PermisoEntity, Long> {

    @Query("select d from PermisoEntity d where d.activo=true")
    List<PermisoEntity> findAllCustom();

}