package pe.com.promantenimineto.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import pe.com.promantenimineto.entity.IncidenciaEntity;

public interface IncidenciaService {

	List<IncidenciaEntity> findAll();
	
	List<IncidenciaEntity> findAllCustom();
	
	List<IncidenciaEntity> findIncidenciasAsignadas();
	
	IncidenciaEntity findById(Long id);
	
	IncidenciaEntity add(IncidenciaEntity obj);
	
	IncidenciaEntity update(IncidenciaEntity obj, Long id);
	
	IncidenciaEntity delete(Long id);
	
	IncidenciaEntity enable(Long id);
	
	IncidenciaEntity addWithEvidencias(
	    IncidenciaEntity obj,
	    List<MultipartFile> archivos
	);
	
	IncidenciaEntity clasificar(IncidenciaEntity obj, Long id);
	
	
}
