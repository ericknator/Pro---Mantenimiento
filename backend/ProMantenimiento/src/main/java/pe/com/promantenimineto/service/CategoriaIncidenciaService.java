package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.CategoriaIncidenciaEntity;

public interface CategoriaIncidenciaService {
	
	List<CategoriaIncidenciaEntity> findAll();
	
	List<CategoriaIncidenciaEntity> findAllCustom();
	
	CategoriaIncidenciaEntity findById(Long id);
	
	CategoriaIncidenciaEntity add(CategoriaIncidenciaEntity obj);
	
	CategoriaIncidenciaEntity update(CategoriaIncidenciaEntity obj, Long id);
	
	CategoriaIncidenciaEntity delete(Long id);
	
	CategoriaIncidenciaEntity enable(Long id);

}
