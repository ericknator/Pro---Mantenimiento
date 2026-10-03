package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.FrecuenciaMantenimientoEntity;

public interface FrecuenciaMantenimientoService {
	
	List<FrecuenciaMantenimientoEntity> findAll();
	
	List<FrecuenciaMantenimientoEntity> findAllCustom();
	
	FrecuenciaMantenimientoEntity findById(Long id);
	
	FrecuenciaMantenimientoEntity add(FrecuenciaMantenimientoEntity obj);
	
	FrecuenciaMantenimientoEntity update(FrecuenciaMantenimientoEntity obj, Long id);
	
	FrecuenciaMantenimientoEntity delete(Long id);
	
	FrecuenciaMantenimientoEntity enable(Long id);

}
