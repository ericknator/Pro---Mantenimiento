package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.UnidadResidencialEntity;

public interface UnidadResidencialService {

	List<UnidadResidencialEntity> findAll();
	
	List<UnidadResidencialEntity> findAllCustom();
	
	UnidadResidencialEntity findById(Long id);
	
	UnidadResidencialEntity add(UnidadResidencialEntity obj);
	
	UnidadResidencialEntity update(UnidadResidencialEntity obj, Long id);
	
	UnidadResidencialEntity delete(Long id);
	
	UnidadResidencialEntity enable(Long id);
}
