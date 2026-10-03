package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.AuditoriaSistemaEntity;

public interface AuditoriaSistemaService {
	
	List<AuditoriaSistemaEntity> findAll();
	
	List<AuditoriaSistemaEntity> findAllCustom();
	
	AuditoriaSistemaEntity findById(Long id);
	
	AuditoriaSistemaEntity add(AuditoriaSistemaEntity obj);
	
	AuditoriaSistemaEntity update(AuditoriaSistemaEntity obj, Long id);
	
	AuditoriaSistemaEntity delete(Long id);
	
	AuditoriaSistemaEntity enable(Long id);

}
