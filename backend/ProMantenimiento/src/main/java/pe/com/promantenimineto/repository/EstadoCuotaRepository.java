package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.EstadoCuotaEntity;

public interface EstadoCuotaRepository extends JpaRepository<EstadoCuotaEntity, Long> {

    @Query("select d from EstadoCuotaEntity d where d.activo=true")
    List<EstadoCuotaEntity> findAllCustom();

}