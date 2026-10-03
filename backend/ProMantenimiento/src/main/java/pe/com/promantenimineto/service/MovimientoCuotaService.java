package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.MovimientoCuotaEntity;

public interface MovimientoCuotaService {
	
	List<MovimientoCuotaEntity> findAll();
	
	List<MovimientoCuotaEntity> findAllCustom();
	
	MovimientoCuotaEntity findById(Long id);
	
	MovimientoCuotaEntity add(MovimientoCuotaEntity obj);
	
	MovimientoCuotaEntity update(MovimientoCuotaEntity obj, Long id);
	
	MovimientoCuotaEntity delete(Long id);
	
	MovimientoCuotaEntity enable(Long id);

}
