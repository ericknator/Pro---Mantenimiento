package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.UnidadResidencialEntity;

public interface UnidadResidencialRepository extends JpaRepository<UnidadResidencialEntity, Long> {

    @Query("select d from UnidadResidencialEntity d where d.activo=true")
    List<UnidadResidencialEntity> findAllCustom();

}