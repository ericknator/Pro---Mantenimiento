package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.TareaPreventivaEntity;

public interface TareaPreventivaService {
	
	List<TareaPreventivaEntity> findAll();
	
	List<TareaPreventivaEntity> findAllCustom();
	
	TareaPreventivaEntity findById(Long id);
	
	TareaPreventivaEntity add(TareaPreventivaEntity obj);
	
	TareaPreventivaEntity update(TareaPreventivaEntity obj, Long id);
	
	TareaPreventivaEntity delete(Long id);
	
	TareaPreventivaEntity enable(Long id);

}
