package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.ActuacionIncidenciaEntity;

public interface ActuacionIncidenciaService {
	
	List<ActuacionIncidenciaEntity> findAll();
	
	List<ActuacionIncidenciaEntity> findAllCustom();
	
	ActuacionIncidenciaEntity findById(Long id);
	
	ActuacionIncidenciaEntity add(ActuacionIncidenciaEntity obj);
	
	ActuacionIncidenciaEntity update(ActuacionIncidenciaEntity obj, Long id);
	
	ActuacionIncidenciaEntity delete(Long id);
	
	ActuacionIncidenciaEntity enable(Long id);

}
