package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.TipoEvidenciaEntity;

public interface TipoEvidenciaService {

	List<TipoEvidenciaEntity> findAll();
	
	List<TipoEvidenciaEntity> findAllCustom();
	
	TipoEvidenciaEntity findById(Long id);
	
	TipoEvidenciaEntity add(TipoEvidenciaEntity obj);
	
	TipoEvidenciaEntity update(TipoEvidenciaEntity obj, Long id);
	
	TipoEvidenciaEntity delete(Long id);
	
	TipoEvidenciaEntity enable(Long id);
}
