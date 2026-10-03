package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.TipoActivoEntity;

public interface TipoActivoService {
	
	List<TipoActivoEntity> findAll();
	
	List<TipoActivoEntity> findAllCustom();
	
	TipoActivoEntity findById(Long id);
	
	TipoActivoEntity add(TipoActivoEntity obj);
	
	TipoActivoEntity update(TipoActivoEntity obj, Long id);
	
	TipoActivoEntity delete(Long id);
	
	TipoActivoEntity enable(Long id);

}
