package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.EstadoIncidenciaEntity;

public interface EstadoIncidenciaRepository extends JpaRepository<EstadoIncidenciaEntity, Long> {

    @Query("select d from EstadoIncidenciaEntity d where d.activo=true")
    List<EstadoIncidenciaEntity> findAllCustom();

}