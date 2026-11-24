package pe.com.promantenimineto.restcontroller;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import pe.com.promantenimineto.exception.AdminUsuarioException;

@RestControllerAdvice(assignableTypes = AdminUsuarioRestController.class)
public class AdminUsuarioExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(AdminUsuarioExceptionHandler.class);

    @ExceptionHandler(AdminUsuarioException.class)
    public ResponseEntity<Map<String, Object>> manejarDominio(AdminUsuarioException exception) {
        return ResponseEntity.status(exception.getStatus()).body(error(
                exception.getCodigo(), exception.getMessage(), List.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(MethodArgumentNotValidException exception) {
        List<String> detalles = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();
        return ResponseEntity.badRequest().body(error(
                "DATOS_INVALIDOS", "Revisa los datos enviados.", detalles));
    }

    @ExceptionHandler({HttpMessageNotReadableException.class, IllegalArgumentException.class})
    public ResponseEntity<Map<String, Object>> manejarSolicitudInvalida(Exception exception) {
        return ResponseEntity.badRequest().body(error(
                "SOLICITUD_INVALIDA", "La solicitud no tiene un formato válido.", List.of()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarInesperado(Exception exception) {
        log.error("Error inesperado en gestión administrativa de usuarios.", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error(
                "ERROR_INTERNO", "No se pudo completar la operación.", List.of()));
    }

    private Map<String, Object> error(String codigo, String mensaje, List<String> detalles) {
        return Map.of(
                "codigo", codigo,
                "mensaje", mensaje,
                "detalles", detalles,
                "fecha", OffsetDateTime.now().toString());
    }
}
