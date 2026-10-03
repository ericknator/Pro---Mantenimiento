package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.EvidenciaMantenimientoEntity;

public interface EvidenciaMantenimientoService {
	
	List<EvidenciaMantenimientoEntity> findAll();
	
	List<EvidenciaMantenimientoEntity> findAllCustom();
	
	EvidenciaMantenimientoEntity findById(Long id);
	
	EvidenciaMantenimientoEntity add(EvidenciaMantenimientoEntity obj);
	
	EvidenciaMantenimientoEntity update(EvidenciaMantenimientoEntity obj, Long id);
	
	EvidenciaMantenimientoEntity delete(Long id);
	
	EvidenciaMantenimientoEntity enable(Long id);

}
