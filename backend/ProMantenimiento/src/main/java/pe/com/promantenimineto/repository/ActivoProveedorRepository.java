package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.ActivoProveedorEntity;

public interface ActivoProveedorRepository extends JpaRepository<ActivoProveedorEntity, Long> {

    @Query("select d from ActivoProveedorEntity d where d.activo=true")
    List<ActivoProveedorEntity> findAllCustom();

}