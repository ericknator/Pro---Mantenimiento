package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.EstadoCuotaEntity;

public interface EstadoCuotaService {
	
	List<EstadoCuotaEntity> findAll();
	
	List<EstadoCuotaEntity> findAllCustom();
	
	EstadoCuotaEntity findById(Long id);
	
	EstadoCuotaEntity add(EstadoCuotaEntity obj);
	
	EstadoCuotaEntity update(EstadoCuotaEntity obj, Long id);
	
	EstadoCuotaEntity delete(Long id);
	
	EstadoCuotaEntity enable(Long id);

}
