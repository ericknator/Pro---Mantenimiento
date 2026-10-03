package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.TipoAccionIncidenciaEntity;

public interface TipoAccionIncidenciaService {
	
	List<TipoAccionIncidenciaEntity> findAll();
	
	List<TipoAccionIncidenciaEntity> findAllCustom();
	
	TipoAccionIncidenciaEntity findById(Long id);
	
	TipoAccionIncidenciaEntity add(TipoAccionIncidenciaEntity obj);
	
	TipoAccionIncidenciaEntity update(TipoAccionIncidenciaEntity obj, Long id);
	
	TipoAccionIncidenciaEntity delete(Long id);
	
	TipoAccionIncidenciaEntity enable(Long id);

}
