package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.AlertaMantenimientoEntity;

public interface AlertaMantenimientoService {
	
	List<AlertaMantenimientoEntity> findAll();
	
	List<AlertaMantenimientoEntity> findAllCustom();
	
	AlertaMantenimientoEntity findById(Long id);
	
	AlertaMantenimientoEntity add(AlertaMantenimientoEntity obj);
	
	AlertaMantenimientoEntity update(AlertaMantenimientoEntity obj, Long id);
	
	AlertaMantenimientoEntity delete(Long id);
	
	AlertaMantenimientoEntity enable(Long id);

}
