package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import pe.com.promantenimineto.entity.IncidenciaEntity;

public interface IncidenciaRepository extends JpaRepository<IncidenciaEntity, Long> {

    @Query("select d from IncidenciaEntity d")
    List<IncidenciaEntity> findAllCustom();
    
    @Query(value = """
    	    SELECT COALESCE(
    	        MAX(CAST(SUBSTRING(codigo, 10) AS UNSIGNED)),
    	        0
    	    )
    	    FROM incidencia
    	    WHERE codigo LIKE CONCAT('INC-', :anio, '-%')
    	    """, nativeQuery = true)
    	int obtenerUltimoCorrelativo(@Param("anio") int anio);

}