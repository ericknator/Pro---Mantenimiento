package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.EstadoVisitaEntity;

public interface EstadoVisitaRepository extends JpaRepository<EstadoVisitaEntity, Long> {

    @Query("select d from EstadoVisitaEntity d where d.activo=true")
    List<EstadoVisitaEntity> findAllCustom();

}