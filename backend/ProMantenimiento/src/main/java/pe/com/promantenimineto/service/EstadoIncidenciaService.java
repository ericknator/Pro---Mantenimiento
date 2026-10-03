package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.EstadoIncidenciaEntity;

public interface EstadoIncidenciaService {
	
	List<EstadoIncidenciaEntity> findAll();
	
	List<EstadoIncidenciaEntity> findAllCustom();
	
	EstadoIncidenciaEntity findById(Long id);
	
	EstadoIncidenciaEntity add(EstadoIncidenciaEntity obj);
	
	EstadoIncidenciaEntity update(EstadoIncidenciaEntity obj, Long id);
	
	EstadoIncidenciaEntity delete(Long id);
	
	EstadoIncidenciaEntity enable(Long id);

}
