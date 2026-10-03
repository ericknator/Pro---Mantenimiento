package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.ComunicadoDestinatarioEntity;

public interface ComunicadoDestinatarioService {
	
	List<ComunicadoDestinatarioEntity> findAll();
	
	List<ComunicadoDestinatarioEntity> findAllCustom();
	
	ComunicadoDestinatarioEntity findById(Long id);
	
	ComunicadoDestinatarioEntity add(ComunicadoDestinatarioEntity obj);
	
	ComunicadoDestinatarioEntity update(ComunicadoDestinatarioEntity obj, Long id);
	
	ComunicadoDestinatarioEntity delete(Long id);
	
	ComunicadoDestinatarioEntity enable(Long id);

}
