package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.TipoAlertaMantenimientoEntity;

public interface TipoAlertaMantenimientoService {
	
	List<TipoAlertaMantenimientoEntity> findAll();
	
	List<TipoAlertaMantenimientoEntity> findAllCustom();
	
	TipoAlertaMantenimientoEntity findById(Long id);
	
	TipoAlertaMantenimientoEntity add(TipoAlertaMantenimientoEntity obj);
	
	TipoAlertaMantenimientoEntity update(TipoAlertaMantenimientoEntity obj, Long id);
	
	TipoAlertaMantenimientoEntity delete(Long id);
	
	TipoAlertaMantenimientoEntity enable(Long id);

}
