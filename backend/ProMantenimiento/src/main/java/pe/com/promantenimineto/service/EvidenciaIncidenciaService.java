package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.EvidenciaIncidenciaEntity;

public interface EvidenciaIncidenciaService {
	
	List<EvidenciaIncidenciaEntity> findAll();
	
	List<EvidenciaIncidenciaEntity> findAllCustom();
	
	EvidenciaIncidenciaEntity findById(Long id);
	
	EvidenciaIncidenciaEntity add(EvidenciaIncidenciaEntity obj);
	
	EvidenciaIncidenciaEntity update(EvidenciaIncidenciaEntity obj, Long id);
	
	EvidenciaIncidenciaEntity delete(Long id);
	
	EvidenciaIncidenciaEntity enable(Long id);
	
}
