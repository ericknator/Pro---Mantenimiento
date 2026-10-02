package pe.com.promantenimineto.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pe.com.promantenimineto.entity.NotificacionEntity;

public interface NotificacionRepository extends JpaRepository<NotificacionEntity, Long> {

    @Query("select d from NotificacionEntity d where d.activo=true")
    List<NotificacionEntity> findAllCustom();

}