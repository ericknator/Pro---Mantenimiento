package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.ActivoEntity;

public interface ActivoService {
	
	List<ActivoEntity> findAll();
	
	List<ActivoEntity> findAllCustom();
	
	ActivoEntity findById(Long id);
	
	ActivoEntity add(ActivoEntity obj);
	
	ActivoEntity update(ActivoEntity obj, Long id);
	
	ActivoEntity delete(Long id);
	
	ActivoEntity enable(Long id);

}
