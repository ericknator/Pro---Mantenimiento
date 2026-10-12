package pe.com.promantenimineto.restcontroller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import pe.com.promantenimineto.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthRestController {

    private final AuthService authService;

    public AuthRestController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/perfil")
    public ResponseEntity<?> obtenerPerfil(
            @RequestHeader("Authorization") String authorization) {

        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Token no proporcionado."));
        }

        String token = authorization.substring(7);

        try {
            return ResponseEntity.ok(authService.obtenerPerfil(token));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }
}
