package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.ComunicadoEntity;

public interface ComunicadoRepository extends JpaRepository<ComunicadoEntity, Long> {

    @Query("select d from ComunicadoEntity d where d.activo=true")
    List<ComunicadoEntity> findAllCustom();

}