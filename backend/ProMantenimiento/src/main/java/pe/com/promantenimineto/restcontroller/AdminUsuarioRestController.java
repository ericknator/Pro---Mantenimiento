package pe.com.promantenimineto.restcontroller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.service.AdminUsuarioService;

@RestController
@Validated
@RequestMapping("/api/admin/usuarios")
public class AdminUsuarioRestController {

    private final AdminUsuarioService service;

    public AdminUsuarioRestController(AdminUsuarioService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AdminUsuarioService.UsuarioView>> listarUsuarios() {
        return ResponseEntity.ok(service.listarUsuarios());
    }

    @GetMapping("/unidades")
    public ResponseEntity<List<AdminUsuarioService.UnidadView>> listarUnidades() {
        return ResponseEntity.ok(service.listarUnidades());
    }

    @PostMapping
    public ResponseEntity<AdminUsuarioService.UsuarioView> registrarUsuario(
            @Valid @RequestBody CrearUsuarioRequest request,
            @AuthenticationPrincipal UsuarioPerfilEntity administrador) {
        Long administradorId = administrador == null ? null : administrador.getId();
        AdminUsuarioService.UsuarioView creado = service.registrar(
                new AdminUsuarioService.CrearUsuarioCommand(
                        request.nombres(),
                        request.apellidos(),
                        request.correo(),
                        request.telefono(),
                        request.claveTemporal(),
                        request.unidadId(),
                        request.relacion()),
                administradorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    public record CrearUsuarioRequest(
            @NotBlank(message = "Los nombres son obligatorios.")
            @Size(max = 100, message = "Los nombres no deben superar 100 caracteres.")
            String nombres,

            @NotBlank(message = "Los apellidos son obligatorios.")
            @Size(max = 120, message = "Los apellidos no deben superar 120 caracteres.")
            String apellidos,

            @NotBlank(message = "El correo es obligatorio.")
            @Email(message = "El correo no tiene un formato válido.")
            @Size(max = 150, message = "El correo no debe superar 150 caracteres.")
            String correo,

            @Size(max = 20, message = "El teléfono no debe superar 20 caracteres.")
            String telefono,

            @NotBlank(message = "La clave temporal es obligatoria.")
            @Size(min = 8, max = 128, message = "La clave temporal debe tener entre 8 y 128 caracteres.")
            String claveTemporal,

            @NotNull(message = "La unidad es obligatoria.")
            Long unidadId,

            @NotBlank(message = "La relación es obligatoria.")
            @Pattern(regexp = "(?i)PROPIETARIO|INQUILINO", message = "La relación debe ser PROPIETARIO o INQUILINO.")
            String relacion) {
    }
}
