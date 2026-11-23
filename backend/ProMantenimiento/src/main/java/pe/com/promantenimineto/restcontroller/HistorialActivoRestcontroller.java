package pe.com.promantenimineto.restcontroller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import pe.com.promantenimineto.projection.HistorialActivoProjection;
import pe.com.promantenimineto.service.HistorialActivoService;

@RestController
@RequestMapping("/api/historial-activos")
@RequiredArgsConstructor
public class HistorialActivoRestcontroller {

    private final HistorialActivoService historialActivoService;

    @GetMapping
    public ResponseEntity<?> listarHistorial() {

        List<HistorialActivoProjection> historial =
                historialActivoService.listarHistorial();

        if (historial.isEmpty()) {
            return ResponseEntity.ok(
                java.util.Map.of(
                    "mensaje", "No existen registros históricos.",
                    "historial", historial
                )
            );
        }

        return ResponseEntity.ok(
            java.util.Map.of(
                "mensaje", "Historial consultado correctamente.",
                "historial", historial
            )
        );
    }
}
