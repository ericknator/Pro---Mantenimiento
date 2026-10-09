package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.AlertaMantenimientoEntity;

public interface AlertaMantenimientoRepository extends JpaRepository<AlertaMantenimientoEntity, Long> {

    @Query("select d from AlertaMantenimientoEntity d")
    List<AlertaMantenimientoEntity> findAllCustom();

}