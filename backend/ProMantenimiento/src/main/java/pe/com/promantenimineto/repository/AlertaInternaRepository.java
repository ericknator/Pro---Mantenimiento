
package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.AlertaInternaEntity;

public interface AlertaInternaRepository
        extends JpaRepository<AlertaInternaEntity, Long> {

    @Query("SELECT a FROM AlertaInternaEntity a ORDER BY a.fechaEmision DESC")
    List<AlertaInternaEntity> findAllCustom();

    List<AlertaInternaEntity> findByResidenteIdOrderByFechaEmisionDesc(Long residenteId);
}
