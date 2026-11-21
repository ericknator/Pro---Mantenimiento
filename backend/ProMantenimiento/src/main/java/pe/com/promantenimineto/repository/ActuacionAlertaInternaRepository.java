package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pe.com.promantenimineto.entity.ActuacionAlertaInternaEntity;

public interface ActuacionAlertaInternaRepository extends JpaRepository<ActuacionAlertaInternaEntity, Long> {
	
	@Query("""
		    SELECT a.observacion FROM ActuacionAlertaInternaEntity a WHERE a.alerta.id = :alertaId AND a.observacion IS NOT NULL ORDER BY a.creadoEn DESC, a.id DESC
		""")
		List<String> findUltimasObservaciones( @Param("alertaId") Long alertaId, Pageable pageable );

}