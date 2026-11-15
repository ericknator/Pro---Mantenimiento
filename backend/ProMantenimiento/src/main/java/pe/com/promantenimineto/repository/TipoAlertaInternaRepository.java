
package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.TipoAlertaInternaEntity;

public interface TipoAlertaInternaRepository
        extends JpaRepository<TipoAlertaInternaEntity, Long> {

    @Query("SELECT t FROM TipoAlertaInternaEntity t WHERE t.activo = true")
    List<TipoAlertaInternaEntity> findAllActivos();

    @Query("SELECT t FROM TipoAlertaInternaEntity t")
    List<TipoAlertaInternaEntity> findAllCustom();
}
