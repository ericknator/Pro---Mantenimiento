package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.ComunicadoDestinatarioEntity;

public interface ComunicadoDestinatarioRepository extends JpaRepository<ComunicadoDestinatarioEntity, Long> {

    @Query("select d from ComunicadoDestinatarioEntity d")
    List<ComunicadoDestinatarioEntity> findAllCustom();

}