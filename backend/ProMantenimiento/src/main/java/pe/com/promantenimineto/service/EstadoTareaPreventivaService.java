package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.EstadoTareaPreventivaEntity;

public interface EstadoTareaPreventivaService {
	
	List<EstadoTareaPreventivaEntity> findAll();
	
	List<EstadoTareaPreventivaEntity> findAllCustom();
	
	EstadoTareaPreventivaEntity findById(Long id);
	
	EstadoTareaPreventivaEntity add(EstadoTareaPreventivaEntity obj);
	
	EstadoTareaPreventivaEntity update(EstadoTareaPreventivaEntity obj, Long id);
	
	EstadoTareaPreventivaEntity delete(Long id);
	
	EstadoTareaPreventivaEntity enable(Long id);

}
