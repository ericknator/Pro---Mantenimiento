
package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import pe.com.promantenimineto.entity.TipoAlertaInternaEntity;
import pe.com.promantenimineto.repository.TipoAlertaInternaRepository;
import pe.com.promantenimineto.service.TipoAlertaInternaService;

@Service
@Transactional
public class TipoAlertaInternaServiceImpl
        implements TipoAlertaInternaService {

    @Autowired
    private TipoAlertaInternaRepository repositorio;

    @Override
    public List<TipoAlertaInternaEntity> findAllActivos() {
        return repositorio.findAllActivos();
    }
}
