package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.RolPermisoEntity;

public interface RolPermisoRepository extends JpaRepository<RolPermisoEntity, Long> {

    @Query("select d from RolPermisoEntity d")
    List<RolPermisoEntity> findAllCustom();

}