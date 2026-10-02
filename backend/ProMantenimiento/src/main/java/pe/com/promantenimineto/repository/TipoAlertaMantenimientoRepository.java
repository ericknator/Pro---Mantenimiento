package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.TipoAlertaMantenimientoEntity;

public interface TipoAlertaMantenimientoRepository extends JpaRepository<TipoAlertaMantenimientoEntity, Long> {

    @Query("select d from TipoAlertaMantenimientoEntity d where d.activo=true")
    List<TipoAlertaMantenimientoEntity> findAllCustom();

}