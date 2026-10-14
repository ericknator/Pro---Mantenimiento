package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.EvidenciaIncidenciaEntity;

public interface EvidenciaIncidenciaRepository extends JpaRepository<EvidenciaIncidenciaEntity, Long> {

    @Query("select d from EvidenciaIncidenciaEntity d")
    List<EvidenciaIncidenciaEntity> findAllCustom();
    
    List<EvidenciaIncidenciaEntity> findByIncidencia_IdOrderByCreadoEnAsc(
    	    Long incidenciaId
    );

}