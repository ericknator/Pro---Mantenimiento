package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.FrecuenciaMantenimientoEntity;

public interface FrecuenciaMantenimientoRepository extends JpaRepository<FrecuenciaMantenimientoEntity, Long> {

    @Query("select d from FrecuenciaMantenimientoEntity d where d.activo=true")
    List<FrecuenciaMantenimientoEntity> findAllCustom();

}