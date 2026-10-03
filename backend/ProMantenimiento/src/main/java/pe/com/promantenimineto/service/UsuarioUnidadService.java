package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.UsuarioUnidadEntity;

public interface UsuarioUnidadService {

	List<UsuarioUnidadEntity> findAll();
	
	List<UsuarioUnidadEntity> findAllCustom();
	
	UsuarioUnidadEntity findById(Long id);
	
	UsuarioUnidadEntity add(UsuarioUnidadEntity obj);
	
	UsuarioUnidadEntity update(UsuarioUnidadEntity obj, Long id);
	
	UsuarioUnidadEntity delete(Long id);
	
	UsuarioUnidadEntity enable(Long id);
}
