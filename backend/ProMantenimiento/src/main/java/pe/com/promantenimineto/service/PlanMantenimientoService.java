package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.PlanMantenimientoEntity;

public interface PlanMantenimientoService {
	
	List<PlanMantenimientoEntity> findAll();
	
	List<PlanMantenimientoEntity> findAllCustom();
	
	PlanMantenimientoEntity findById(Long id);
	
	PlanMantenimientoEntity add(PlanMantenimientoEntity obj);
	
	PlanMantenimientoEntity update(PlanMantenimientoEntity obj, Long id);
	
	PlanMantenimientoEntity delete(Long id);
	
	PlanMantenimientoEntity enable(Long id);

}
