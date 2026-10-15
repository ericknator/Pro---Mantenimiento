package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.UsuarioPerfilEntity;

public interface UsuarioPerfilService {
	
	List<UsuarioPerfilEntity> findAll();
	
	List<UsuarioPerfilEntity> findAllCustom();
	
	List<UsuarioPerfilEntity> findResponsablesByRol(Long rolId);
	
	UsuarioPerfilEntity findById(Long id);
	
	UsuarioPerfilEntity add(UsuarioPerfilEntity obj);
	
	UsuarioPerfilEntity update(UsuarioPerfilEntity obj, Long id);
	
	UsuarioPerfilEntity delete(Long id);
	
	UsuarioPerfilEntity enable(Long id);

}
