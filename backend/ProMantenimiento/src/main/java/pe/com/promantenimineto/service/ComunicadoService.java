package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.ComunicadoEntity;

public interface ComunicadoService {
	
	List<ComunicadoEntity> findAll();
	
	List<ComunicadoEntity> findAllCustom();
	
	ComunicadoEntity findById(Long id);
	
	ComunicadoEntity add(ComunicadoEntity obj);
	
	ComunicadoEntity update(ComunicadoEntity obj, Long id);
	
	ComunicadoEntity delete(Long id);
	
	ComunicadoEntity enable(Long id);

}
