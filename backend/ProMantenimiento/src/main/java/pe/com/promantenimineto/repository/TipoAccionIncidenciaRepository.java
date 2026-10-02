package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.TipoAccionIncidenciaEntity;

public interface TipoAccionIncidenciaRepository extends JpaRepository<TipoAccionIncidenciaEntity, Long> {

    @Query("select d from TipoAccionIncidenciaEntity d where d.activo=true")
    List<TipoAccionIncidenciaEntity> findAllCustom();

}