package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.PlanMantenimientoEntity;

public interface PlanMantenimientoRepository extends JpaRepository<PlanMantenimientoEntity, Long> {

    @Query("select d from PlanMantenimientoEntity d where d.activo=true")
    List<PlanMantenimientoEntity> findAllCustom();

}