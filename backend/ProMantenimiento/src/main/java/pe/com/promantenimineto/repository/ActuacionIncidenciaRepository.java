package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.ActuacionIncidenciaEntity;

public interface ActuacionIncidenciaRepository extends JpaRepository<ActuacionIncidenciaEntity, Long> {

    @Query("select d from ActuacionIncidenciaEntity d")
    List<ActuacionIncidenciaEntity> findAllCustom();

}