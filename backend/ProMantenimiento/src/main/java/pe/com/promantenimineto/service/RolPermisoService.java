package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.RolPermisoEntity;

public interface RolPermisoService {

	List<RolPermisoEntity> findAll();
	
	List<RolPermisoEntity> findAllCustom();
	
	RolPermisoEntity findById(Long id);
	
	RolPermisoEntity add(RolPermisoEntity obj);
	
	RolPermisoEntity update(RolPermisoEntity obj, Long id);
	
	RolPermisoEntity delete(Long id);
	
	RolPermisoEntity enable(Long id);
}
