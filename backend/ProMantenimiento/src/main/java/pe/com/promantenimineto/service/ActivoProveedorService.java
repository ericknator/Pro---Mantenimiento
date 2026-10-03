package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.ActivoProveedorEntity;

public interface ActivoProveedorService {
	
	List<ActivoProveedorEntity> findAll();
	
	List<ActivoProveedorEntity> findAllCustom();
	
	ActivoProveedorEntity findById(Long id);
	
	ActivoProveedorEntity add(ActivoProveedorEntity obj);
	
	ActivoProveedorEntity update(ActivoProveedorEntity obj, Long id);
	
	ActivoProveedorEntity delete(Long id);
	
	ActivoProveedorEntity enable(Long id);

}
