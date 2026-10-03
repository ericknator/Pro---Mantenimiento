package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.IntervencionPreventivaEntity;

public interface IntervencionPreventivaService {
	
	List<IntervencionPreventivaEntity> findAll();
	
	List<IntervencionPreventivaEntity> findAllCustom();
	
	IntervencionPreventivaEntity findById(Long id);
	
	IntervencionPreventivaEntity add(IntervencionPreventivaEntity obj);
	
	IntervencionPreventivaEntity update(IntervencionPreventivaEntity obj, Long id);
	
	IntervencionPreventivaEntity delete(Long id);
	
	IntervencionPreventivaEntity enable(Long id);

}
