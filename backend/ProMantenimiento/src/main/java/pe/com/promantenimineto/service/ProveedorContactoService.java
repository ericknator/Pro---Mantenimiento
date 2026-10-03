package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.ProveedorContactoEntity;

public interface ProveedorContactoService {
	
	List<ProveedorContactoEntity> findAll();
	
	List<ProveedorContactoEntity> findAllCustom();
	
	ProveedorContactoEntity findById(Long id);
	
	ProveedorContactoEntity add(ProveedorContactoEntity obj);
	
	ProveedorContactoEntity update(ProveedorContactoEntity obj, Long id);
	
	ProveedorContactoEntity delete(Long id);
	
	ProveedorContactoEntity enable(Long id);

}
