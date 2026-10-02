package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.ParametroSistemaEntity;

public interface ParametroSistemaRepository extends JpaRepository<ParametroSistemaEntity, Long> {

    @Query("select d from ParametroSistemaEntity d")
    List<ParametroSistemaEntity> findAllCustom();

}