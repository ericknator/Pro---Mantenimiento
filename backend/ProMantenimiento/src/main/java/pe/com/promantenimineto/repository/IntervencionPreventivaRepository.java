package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.IntervencionPreventivaEntity;

public interface IntervencionPreventivaRepository extends JpaRepository<IntervencionPreventivaEntity, Long> {

    @Query("select d from IntervencionPreventivaEntity d where d.activo=true")
    List<IntervencionPreventivaEntity> findAllCustom();

}