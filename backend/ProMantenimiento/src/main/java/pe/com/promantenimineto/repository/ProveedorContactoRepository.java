package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.ProveedorContactoEntity;

public interface ProveedorContactoRepository extends JpaRepository<ProveedorContactoEntity, Long> {

    @Query("select d from ProveedorContactoEntity d where d.activo=true")
    List<ProveedorContactoEntity> findAllCustom();

}