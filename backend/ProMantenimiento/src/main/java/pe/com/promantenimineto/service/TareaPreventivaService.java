package pe.com.promantenimineto.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import pe.com.promantenimineto.entity.IntervencionPreventivaEntity;
import pe.com.promantenimineto.entity.TareaPreventivaEntity;

public interface TareaPreventivaService {
	
	List<TareaPreventivaEntity> findAll();
	
	List<TareaPreventivaEntity> findAllCustom();
	
	TareaPreventivaEntity findById(Long id);
	
	TareaPreventivaEntity add(TareaPreventivaEntity obj);
	
	TareaPreventivaEntity update(TareaPreventivaEntity obj, Long id);
	
	TareaPreventivaEntity delete(Long id);
	
	TareaPreventivaEntity enable(Long id);
	
	List<TareaPreventivaEntity> findByResponsableId(Long responsableId);
	
	TareaPreventivaEntity iniciarAtencion(Long id, Long responsableId);
	
	IntervencionPreventivaEntity registrarIntervencion(
	        Long id,
	        Long ejecutorId,
	        LocalDateTime fechaEjecucion,
	        String observaciones,
	        String accionesRealizadas,
	        List<MultipartFile> archivos
	);

}
