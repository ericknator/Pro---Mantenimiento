package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.TipoNotificacionEntity;

public interface TipoNotificacionRepository extends JpaRepository<TipoNotificacionEntity, Long> {

    @Query("select d from TipoNotificacionEntity d where d.activo=true")
    List<TipoNotificacionEntity> findAllCustom();

}