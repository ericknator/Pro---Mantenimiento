package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.DocumentoPagoEntity;

public interface DocumentoPagoService {
	
	List<DocumentoPagoEntity> findAll();
	
	List<DocumentoPagoEntity> findAllCustom();
	
	DocumentoPagoEntity findById(Long id);
	
	DocumentoPagoEntity add(DocumentoPagoEntity obj);
	
	DocumentoPagoEntity update(DocumentoPagoEntity obj, Long id);
	
	DocumentoPagoEntity delete(Long id);
	
	DocumentoPagoEntity enable(Long id);

}
