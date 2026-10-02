package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.PrioridadIncidenciaEntity;

public interface PrioridadIncidenciaRepository extends JpaRepository<PrioridadIncidenciaEntity, Long> {

    @Query("select d from PrioridadIncidenciaEntity d where d.activo=true")
    List<PrioridadIncidenciaEntity> findAllCustom();

}