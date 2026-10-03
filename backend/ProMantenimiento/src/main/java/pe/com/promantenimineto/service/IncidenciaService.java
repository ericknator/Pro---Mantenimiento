package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.IncidenciaEntity;

public interface IncidenciaService {

	List<IncidenciaEntity> findAll();
	
	List<IncidenciaEntity> findAllCustom();
	
	IncidenciaEntity findById(Long id);
	
	IncidenciaEntity add(IncidenciaEntity obj);
	
	IncidenciaEntity update(IncidenciaEntity obj, Long id);
	
	IncidenciaEntity delete(Long id);
	
	IncidenciaEntity enable(Long id);
	
}
