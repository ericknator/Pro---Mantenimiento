package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.CuotaUnidadEntity;

public interface CuotaUnidadService {
	
	List<CuotaUnidadEntity> findAll();
	
	List<CuotaUnidadEntity> findAllCustom();
	
	CuotaUnidadEntity findById(Long id);
	
	CuotaUnidadEntity add(CuotaUnidadEntity obj);
	
	CuotaUnidadEntity update(CuotaUnidadEntity obj, Long id);
	
	CuotaUnidadEntity delete(Long id);
	
	CuotaUnidadEntity enable(Long id);

}
