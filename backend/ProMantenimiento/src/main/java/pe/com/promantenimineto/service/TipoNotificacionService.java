package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.TipoNotificacionEntity;

public interface TipoNotificacionService {
	
	List<TipoNotificacionEntity> findAll();
	
	List<TipoNotificacionEntity> findAllCustom();
	
	TipoNotificacionEntity findById(Long id);
	
	TipoNotificacionEntity add(TipoNotificacionEntity obj);
	
	TipoNotificacionEntity update(TipoNotificacionEntity obj, Long id);
	
	TipoNotificacionEntity delete(Long id);
	
	TipoNotificacionEntity enable(Long id);

}
