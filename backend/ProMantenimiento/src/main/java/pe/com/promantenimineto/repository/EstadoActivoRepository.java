package pe.com.promantenimineto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.EstadoActivoEntity;

public interface EstadoActivoRepository extends JpaRepository<EstadoActivoEntity, Long> {

    @Query("select d from EstadoActivoEntity d where d.activo=true")
    List<EstadoActivoEntity> findAllCustom();
    
    Optional<EstadoActivoEntity> findByCodigoAndActivoTrue(String codigo);

}