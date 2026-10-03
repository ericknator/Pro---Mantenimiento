package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.CondominioEntity;

public interface CondominioService {

	List<CondominioEntity> findAll();
	
	List<CondominioEntity> findAllCustom();
	
	CondominioEntity findById(Long id);
	
	CondominioEntity add(CondominioEntity obj);
	
	CondominioEntity update(CondominioEntity obj, Long id);
	
	CondominioEntity delete(Long id);
	
	CondominioEntity enable(Long id);
}
