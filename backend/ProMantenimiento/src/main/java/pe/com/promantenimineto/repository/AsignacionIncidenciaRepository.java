package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.AsignacionIncidenciaEntity;

public interface AsignacionIncidenciaRepository extends JpaRepository<AsignacionIncidenciaEntity, Long> {

    @Query("select d from AsignacionIncidenciaEntity d")
    List<AsignacionIncidenciaEntity> findAllCustom();

}