package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.EstadoActivoEntity;

public interface EstadoActivoService {
	
	List<EstadoActivoEntity> findAll();
	
	List<EstadoActivoEntity> findAllCustom();
	
	EstadoActivoEntity findById(Long id);
	
	EstadoActivoEntity add(EstadoActivoEntity obj);
	
	EstadoActivoEntity update(EstadoActivoEntity obj, Long id);
	
	EstadoActivoEntity delete(Long id);
	
	EstadoActivoEntity enable(Long id);

}
