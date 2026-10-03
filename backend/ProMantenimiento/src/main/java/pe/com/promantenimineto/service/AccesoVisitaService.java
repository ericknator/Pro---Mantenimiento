package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.AccesoVisitaEntity;

public interface AccesoVisitaService {
	
	List<AccesoVisitaEntity> findAll();
	
	List<AccesoVisitaEntity> findAllCustom();
	
	AccesoVisitaEntity findById(Long id);
	
	AccesoVisitaEntity add(AccesoVisitaEntity obj);
	
	AccesoVisitaEntity update(AccesoVisitaEntity obj, Long id);
	
	AccesoVisitaEntity delete(Long id);
	
	AccesoVisitaEntity enable(Long id);

}
