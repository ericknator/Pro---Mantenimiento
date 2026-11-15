package pe.com.promantenimineto.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pe.com.promantenimineto.entity.TipoAlertaInternaEntity;
import pe.com.promantenimineto.service.TipoAlertaInternaService;

@RestController
@CrossOrigin
@RequestMapping("/api/tipo-alerta-interna")
public class TipoAlertaInternaRestController {

    @Autowired
    private TipoAlertaInternaService servicio;

    @GetMapping
    public List<TipoAlertaInternaEntity> findAllActivos() {
        return servicio.findAllActivos();
    }
}
