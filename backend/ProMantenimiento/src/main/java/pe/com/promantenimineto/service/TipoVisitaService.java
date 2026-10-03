package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.TipoVisitaEntity;

public interface TipoVisitaService {
	
	List<TipoVisitaEntity> findAll();
	
	List<TipoVisitaEntity> findAllCustom();
	
	TipoVisitaEntity findById(Long id);
	
	TipoVisitaEntity add(TipoVisitaEntity obj);
	
	TipoVisitaEntity update(TipoVisitaEntity obj, Long id);
	
	TipoVisitaEntity delete(Long id);
	
	TipoVisitaEntity enable(Long id);

}
