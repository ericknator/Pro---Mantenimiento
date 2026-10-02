package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.IncidenciaEntity;

public interface IncidenciaRepository extends JpaRepository<IncidenciaEntity, Long> {

    @Query("select d from IncidenciaEntity d where d.activo=true")
    List<IncidenciaEntity> findAllCustom();

}