package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.EstadoPlanMantenimientoEntity;

public interface EstadoPlanMantenimientoService {
	
	List<EstadoPlanMantenimientoEntity> findAll();
	
	List<EstadoPlanMantenimientoEntity> findAllCustom();
	
	EstadoPlanMantenimientoEntity findById(Long id);
	
	EstadoPlanMantenimientoEntity add(EstadoPlanMantenimientoEntity obj);
	
	EstadoPlanMantenimientoEntity update(EstadoPlanMantenimientoEntity obj, Long id);
	
	EstadoPlanMantenimientoEntity delete(Long id);
	
	EstadoPlanMantenimientoEntity enable(Long id);
	
}