package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.MovimientoCuotaEntity;

public interface MovimientoCuotaRepository extends JpaRepository<MovimientoCuotaEntity, Long> {

    @Query("select d from MovimientoCuotaEntity d")
    List<MovimientoCuotaEntity> findAllCustom();

}