package pe.com.promantenimineto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.TipoEvidenciaEntity;

public interface TipoEvidenciaRepository extends JpaRepository<TipoEvidenciaEntity, Long> {

    @Query("select d from TipoEvidenciaEntity d where d.activo=true")
    List<TipoEvidenciaEntity> findAllCustom();
    
    Optional<TipoEvidenciaEntity> findByCodigoAndActivoTrue(String codigo);

}