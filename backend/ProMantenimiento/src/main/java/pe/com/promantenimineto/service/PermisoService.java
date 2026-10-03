package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.PermisoEntity;

public interface PermisoService {
	
	List<PermisoEntity> findAll();
	
	List<PermisoEntity> findAllCustom();
	
	PermisoEntity findById(Long id);
	
	PermisoEntity add(PermisoEntity obj);
	
	PermisoEntity update(PermisoEntity obj, Long id);
	
	PermisoEntity delete(Long id);
	
	PermisoEntity enable(Long id);

}
