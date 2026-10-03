package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.ParametroSistemaEntity;

public interface ParametroSistemaService {
	
	List<ParametroSistemaEntity> findAll();
	
	List<ParametroSistemaEntity> findAllCustom();
	
	ParametroSistemaEntity findById(Long id);
	
	ParametroSistemaEntity add(ParametroSistemaEntity obj);
	
	ParametroSistemaEntity update(ParametroSistemaEntity obj, Long id);
	
	ParametroSistemaEntity delete(Long id);
	
	ParametroSistemaEntity enable(Long id);
	
}
