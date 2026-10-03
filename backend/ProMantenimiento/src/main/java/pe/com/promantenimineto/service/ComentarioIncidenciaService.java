package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.ComentarioIncidenciaEntity;

public interface ComentarioIncidenciaService {
	
	List<ComentarioIncidenciaEntity> findAll();
	
	List<ComentarioIncidenciaEntity> findAllCustom();
	
	ComentarioIncidenciaEntity findById(Long id);
	
	ComentarioIncidenciaEntity add(ComentarioIncidenciaEntity obj);
	
	ComentarioIncidenciaEntity update(ComentarioIncidenciaEntity obj, Long id);
	
	ComentarioIncidenciaEntity delete(Long id);
	
	ComentarioIncidenciaEntity enable(Long id);

}
