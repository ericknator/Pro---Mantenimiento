package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.TipoVisitaEntity;

public interface TipoVisitaRepository extends JpaRepository<TipoVisitaEntity, Long> {

    @Query("select d from TipoVisitaEntity d where d.activo=true")
    List<TipoVisitaEntity> findAllCustom();

}