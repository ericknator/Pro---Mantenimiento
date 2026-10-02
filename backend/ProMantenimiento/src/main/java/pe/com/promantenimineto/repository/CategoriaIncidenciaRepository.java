package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.CategoriaIncidenciaEntity;

public interface CategoriaIncidenciaRepository extends JpaRepository<CategoriaIncidenciaEntity, Long> {

    @Query("select d from CategoriaIncidenciaEntity d where d.activo=true")
    List<CategoriaIncidenciaEntity> findAllCustom();

}