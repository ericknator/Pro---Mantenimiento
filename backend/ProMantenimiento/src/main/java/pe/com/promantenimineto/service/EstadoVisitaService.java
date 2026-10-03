package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.EstadoVisitaEntity;

public interface EstadoVisitaService {
	
	List<EstadoVisitaEntity> findAll();
	
	List<EstadoVisitaEntity> findAllCustom();
	
	EstadoVisitaEntity findById(Long id);
	
	EstadoVisitaEntity add(EstadoVisitaEntity obj);
	
	EstadoVisitaEntity update(EstadoVisitaEntity obj, Long id);
	
	EstadoVisitaEntity delete(Long id);
	
	EstadoVisitaEntity enable(Long id);

}
