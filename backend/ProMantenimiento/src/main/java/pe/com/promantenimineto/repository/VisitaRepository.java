package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.VisitaEntity;

public interface VisitaRepository extends JpaRepository<VisitaEntity, Long> {

    @Query("select d from VisitaEntity d where d.activo=true")
    List<VisitaEntity> findAllCustom();

}