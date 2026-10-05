package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.NotificacionEntity;

public interface NotificacionService {
	
	List<NotificacionEntity> findAll();
	
	List<NotificacionEntity> findAllCustom();
	
	NotificacionEntity findById(Long id);
	
	NotificacionEntity add(NotificacionEntity obj);
	
	NotificacionEntity update(NotificacionEntity obj, Long id);
	
	NotificacionEntity delete(Long id);
	
	NotificacionEntity enable(Long id);

}
