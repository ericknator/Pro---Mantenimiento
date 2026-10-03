package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.TorreEntity;

public interface TorreService {
	
	List<TorreEntity> findAll();
	
	List<TorreEntity> findAllCustom();
	
	TorreEntity findById(Long id);
	
	TorreEntity add(TorreEntity obj);
	
	TorreEntity update(TorreEntity obj, Long id);
	
	TorreEntity delete(Long id);
	
	TorreEntity enable(Long id);

}
