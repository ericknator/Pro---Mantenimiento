package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.ActivoEntity;

public interface ActivoRepository extends JpaRepository<ActivoEntity, Long> {

    @Query("select d from ActivoEntity d where d.activo=true")
    List<ActivoEntity> findAllCustom();

}