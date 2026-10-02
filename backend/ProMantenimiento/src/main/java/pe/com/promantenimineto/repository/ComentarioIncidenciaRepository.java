package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.ComentarioIncidenciaEntity;

public interface ComentarioIncidenciaRepository extends JpaRepository<ComentarioIncidenciaEntity, Long> {

    @Query("select d from ComentarioIncidenciaEntity d where d.activo=true")
    List<ComentarioIncidenciaEntity> findAllCustom();

}