
package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.entity.AlertaInternaEntity;

public interface AlertaInternaService {
	
	AlertaInternaEntity findById(Long id);

    AlertaInternaEntity emitir(
            Long tipoAlertaId,
            String ubicacion,
            String descripcion
    );

    List<AlertaInternaEntity> findAllBandeja();

    List<AlertaInternaEntity> findByResidente();
    
    AlertaInternaEntity confirmarRecepcion(Long id);
    
    AlertaInternaEntity actualizarEstado(Long id, String observacion);

}
