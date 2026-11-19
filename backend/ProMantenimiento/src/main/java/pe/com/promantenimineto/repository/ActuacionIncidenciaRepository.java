package pe.com.promantenimineto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.ActuacionIncidenciaEntity;
import pe.com.promantenimineto.entity.TipoAccionIncidenciaEntity;

public interface ActuacionIncidenciaRepository extends JpaRepository<ActuacionIncidenciaEntity, Long> {

    @Query("select d from ActuacionIncidenciaEntity d")
    List<ActuacionIncidenciaEntity> findAllCustom();
    
    Optional<ActuacionIncidenciaEntity>
    findFirstByIncidenciaIdAndTipoAccionCodigoOrderByCreadoEnDesc( Long incidenciaId, String codigo );

}