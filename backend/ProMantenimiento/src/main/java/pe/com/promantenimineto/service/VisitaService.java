package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.VisitaEntity;

public interface VisitaService {
	
	List<VisitaEntity> findAll();
	
	List<VisitaEntity> findAllCustom();
	
	VisitaEntity findById(Long id);
	
	VisitaEntity add(VisitaEntity obj);
	
	VisitaEntity update(VisitaEntity obj, Long id);
	
	VisitaEntity delete(Long id);
	
	VisitaEntity enable(Long id);

}
