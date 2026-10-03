package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.AsignacionIncidenciaEntity;

public interface AsignacionIncidenciaService {

	List<AsignacionIncidenciaEntity> findAll();
	
	List<AsignacionIncidenciaEntity> findAllCustom();
	
	AsignacionIncidenciaEntity findById(Long id);
	
	AsignacionIncidenciaEntity add(AsignacionIncidenciaEntity obj);
	
	AsignacionIncidenciaEntity update(AsignacionIncidenciaEntity obj, Long id);
	
	AsignacionIncidenciaEntity delete(Long id);
	
	AsignacionIncidenciaEntity enable(Long id);
	
}
