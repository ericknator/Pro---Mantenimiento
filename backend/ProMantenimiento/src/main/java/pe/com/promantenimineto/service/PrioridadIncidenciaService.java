package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.PrioridadIncidenciaEntity;

public interface PrioridadIncidenciaService {

	List<PrioridadIncidenciaEntity> findAll();
	
	List<PrioridadIncidenciaEntity> findAllCustom();
	
	PrioridadIncidenciaEntity findById(Long id);
	
	PrioridadIncidenciaEntity add(PrioridadIncidenciaEntity obj);
	
	PrioridadIncidenciaEntity update(PrioridadIncidenciaEntity obj, Long id);
	
	PrioridadIncidenciaEntity delete(Long id);
	
	PrioridadIncidenciaEntity enable(Long id);
}
