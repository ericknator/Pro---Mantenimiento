
package pe.com.promantenimineto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.EstadoAlertaInternaEntity;

public interface EstadoAlertaInternaRepository
        extends JpaRepository<EstadoAlertaInternaEntity, Long> {

    Optional<EstadoAlertaInternaEntity> findByCodigo(String codigo);

    @Query("SELECT e FROM EstadoAlertaInternaEntity e")
    List<EstadoAlertaInternaEntity> findAllCustom();
}
