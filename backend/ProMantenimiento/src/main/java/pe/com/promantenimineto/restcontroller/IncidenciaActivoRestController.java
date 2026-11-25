package pe.com.promantenimineto.restcontroller;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import pe.com.promantenimineto.service.IncidenciaActivoService;

@RestController
@RequestMapping("/api/incidencia")
public class IncidenciaActivoRestController {
    private final IncidenciaActivoService servicio;

    public IncidenciaActivoRestController(IncidenciaActivoService servicio) {
        this.servicio = servicio;
    }

    @PatchMapping("/{id}/activo")
    public IncidenciaActivoService.RelacionActivo asociar(
            @PathVariable("id") Long id, @RequestBody Map<String, Long> cuerpo) {
        if (cuerpo == null || !cuerpo.containsKey("activoId")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Indica activoId; usa null para quitar la relación.");
        }
        return servicio.asociar(id, cuerpo.get("activoId"));
    }
}
