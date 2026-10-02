package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.EstadoPlanMantenimientoEntity;

public interface EstadoPlanMantenimientoRepository extends JpaRepository<EstadoPlanMantenimientoEntity, Long> {

    @Query("select d from EstadoPlanMantenimientoEntity d where d.activo=true")
    List<EstadoPlanMantenimientoEntity> findAllCustom();

}