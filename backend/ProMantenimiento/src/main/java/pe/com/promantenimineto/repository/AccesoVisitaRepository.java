package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.AccesoVisitaEntity;

public interface AccesoVisitaRepository extends JpaRepository<AccesoVisitaEntity, Long> {

    @Query("select d from AccesoVisitaEntity d where d.activo=true")
    List<AccesoVisitaEntity> findAllCustom();

}