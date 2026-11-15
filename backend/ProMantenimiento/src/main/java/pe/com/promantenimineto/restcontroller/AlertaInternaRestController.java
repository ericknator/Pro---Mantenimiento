package pe.com.promantenimineto.restcontroller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pe.com.promantenimineto.entity.AlertaInternaEntity;
import pe.com.promantenimineto.service.AlertaInternaService;

@RestController
@CrossOrigin
@RequestMapping("/api/alerta-interna")
public class AlertaInternaRestController {

    @Autowired
    private AlertaInternaService servicio;
    
    @GetMapping("/{id}")
    public AlertaInternaEntity findById(@PathVariable Long id) {
        return servicio.findById(id);
    }

    // Emitir alerta interna.
    @PostMapping
    public AlertaInternaEntity emitir( @RequestBody Map<String, Object> body) {
        Long tipoAlertaId = body.get("tipoAlertaId") == null ? null : Long.valueOf(body.get("tipoAlertaId").toString());
        String ubicacion = body.get("ubicacion") == null ? null : body.get("ubicacion").toString();
        String descripcion = body.get("descripcion") == null ? null : body.get("descripcion").toString();
        
        return servicio.emitir( tipoAlertaId, ubicacion, descripcion );
    }

    // Consultar bandeja de administración y portería.
    @GetMapping("/bandeja")
    public List<AlertaInternaEntity> findAllBandeja() {
        return servicio.findAllBandeja();
    }

    // Consultar historial del residente autenticado.
    @GetMapping("/mis-alertas")
    public List<AlertaInternaEntity> findByResidente() {
        return servicio.findByResidente();
    }
}
