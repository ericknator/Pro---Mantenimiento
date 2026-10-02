package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.EstadoTareaPreventivaEntity;

public interface EstadoTareaPreventivaRepository extends JpaRepository<EstadoTareaPreventivaEntity, Long> {

    @Query("select d from EstadoTareaPreventivaEntity d where d.activo=true")
    List<EstadoTareaPreventivaEntity> findAllCustom();

}