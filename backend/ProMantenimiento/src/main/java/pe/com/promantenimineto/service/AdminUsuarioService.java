package pe.com.promantenimineto.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.firebase.auth.AuthErrorCode;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;

import pe.com.promantenimineto.entity.AuditoriaSistemaEntity;
import pe.com.promantenimineto.entity.RolEntity;
import pe.com.promantenimineto.entity.UnidadResidencialEntity;
import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.entity.UsuarioUnidadEntity;
import pe.com.promantenimineto.exception.AdminUsuarioConflictException;
import pe.com.promantenimineto.exception.AdminUsuarioException;
import pe.com.promantenimineto.exception.AdminUsuarioFirebaseException;
import pe.com.promantenimineto.exception.AdminUsuarioNotFoundException;
import pe.com.promantenimineto.exception.AdminUsuarioValidationException;
import pe.com.promantenimineto.repository.AuditoriaSistemaRepository;
import pe.com.promantenimineto.repository.RolRepository;
import pe.com.promantenimineto.repository.UnidadResidencialRepository;
import pe.com.promantenimineto.repository.UsuarioPerfilRepository;
import pe.com.promantenimineto.repository.UsuarioUnidadRepository;

@Service
public class AdminUsuarioService {

    private static final Logger log = LoggerFactory.getLogger(AdminUsuarioService.class);
    private static final String ROL_RESIDENTE = "RESIDENTE";
    private static final List<String> RELACIONES_VALIDAS = List.of("PROPIETARIO", "INQUILINO");

    private final FirebaseAuth firebaseAuth;
    private final UsuarioPerfilRepository usuarioRepository;
    private final UsuarioUnidadRepository usuarioUnidadRepository;
    private final UnidadResidencialRepository unidadRepository;
    private final RolRepository rolRepository;
    private final AuditoriaSistemaRepository auditoriaRepository;

    public AdminUsuarioService(
            FirebaseAuth firebaseAuth,
            UsuarioPerfilRepository usuarioRepository,
            UsuarioUnidadRepository usuarioUnidadRepository,
            UnidadResidencialRepository unidadRepository,
            RolRepository rolRepository,
            AuditoriaSistemaRepository auditoriaRepository) {
        this.firebaseAuth = firebaseAuth;
        this.usuarioRepository = usuarioRepository;
        this.usuarioUnidadRepository = usuarioUnidadRepository;
        this.unidadRepository = unidadRepository;
        this.rolRepository = rolRepository;
        this.auditoriaRepository = auditoriaRepository;
    }

    public List<UsuarioView> listarUsuarios() {
        List<UsuarioPerfilEntity> usuarios = usuarioRepository.findAllByOrderByApellidosAscNombresAsc();
        Map<Long, List<UsuarioUnidadEntity>> relaciones = usuarioUnidadRepository.findAllActivasConDatos()
                .stream()
                .collect(Collectors.groupingBy(relacion -> relacion.getUsuario().getId()));

        return usuarios.stream()
                .map(usuario -> toUsuarioView(usuario, relaciones.getOrDefault(usuario.getId(), List.of())))
                .toList();
    }

    public List<UnidadView> listarUnidades() {
        return unidadRepository.findByActivoTrueOrderByTorre_CodigoAscPisoAscNumeroAsc()
                .stream()
                .map(unidad -> toUnidadView(unidad, null, null))
                .toList();
    }

    @Transactional
    public UsuarioView registrar(CrearUsuarioCommand command, Long administradorId) {
        CrearUsuarioCommand datos = normalizar(command);
        validar(datos);

        if (usuarioRepository.existsByCorreoIgnoreCase(datos.correo())) {
            throw new AdminUsuarioConflictException("Ya existe un perfil con ese correo.");
        }

        RolEntity rol = rolRepository.findByCodigoAndActivoTrue(ROL_RESIDENTE)
                .orElseThrow(() -> new AdminUsuarioException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "ROL_RESIDENTE_NO_CONFIGURADO",
                        "El rol RESIDENTE no está configurado en la base aislada."));

        UnidadResidencialEntity unidad = unidadRepository.findById(datos.unidadId())
                .filter(item -> Boolean.TRUE.equals(item.getActivo()))
                .orElseThrow(() -> new AdminUsuarioNotFoundException(
                        "UNIDAD_NO_ENCONTRADA",
                        "La unidad seleccionada no existe o está inactiva."));

        String firebaseUid = null;
        try {
            UserRecord firebaseUser = firebaseAuth.createUser(new UserRecord.CreateRequest()
                    .setEmail(datos.correo())
                    .setPassword(datos.claveTemporal())
                    .setDisplayName(datos.nombres() + " " + datos.apellidos())
                    .setEmailVerified(false)
                    .setDisabled(false));
            firebaseUid = firebaseUser.getUid();

            LocalDateTime ahora = LocalDateTime.now();
            UsuarioPerfilEntity perfil = UsuarioPerfilEntity.builder()
                    .firebaseUid(firebaseUid)
                    .rol(rol)
                    .nombres(datos.nombres())
                    .apellidos(datos.apellidos())
                    .correo(datos.correo())
                    .telefono(datos.telefono())
                    .activo(true)
                    .creadoEn(ahora)
                    .actualizadoEn(ahora)
                    .build();
            UsuarioPerfilEntity perfilGuardado = usuarioRepository.save(perfil);

            UsuarioUnidadEntity relacion = UsuarioUnidadEntity.builder()
                    .usuario(perfilGuardado)
                    .unidad(unidad)
                    .relacion(datos.relacion())
                    .esPrincipal(true)
                    .activo(true)
                    .creadoEn(ahora)
                    .build();
            usuarioUnidadRepository.save(relacion);

            UsuarioPerfilEntity administrador = administradorId == null
                    ? null
                    : usuarioRepository.getReferenceById(administradorId);
            auditoriaRepository.save(AuditoriaSistemaEntity.builder()
                    .usuario(administrador)
                    .accion("CREAR_USUARIO_RESIDENTE")
                    .entidad("usuario_perfil")
                    .entidadId(String.valueOf(perfilGuardado.getId()))
                    .detalle("relacion=" + datos.relacion() + ";unidadId=" + unidad.getId())
                    .creadoEn(ahora)
                    .build());

            return toUsuarioView(perfilGuardado, List.of(relacion));
        } catch (FirebaseAuthException exception) {
            if (exception.getAuthErrorCode() == AuthErrorCode.EMAIL_ALREADY_EXISTS) {
                throw new AdminUsuarioConflictException("Ya existe una cuenta Firebase con ese correo.");
            }
            throw new AdminUsuarioFirebaseException(
                    "Firebase no pudo crear la cuenta del residente.", exception);
        } catch (RuntimeException exception) {
            if (firebaseUid != null) {
                eliminarCuentaCompensatoria(firebaseUid);
            }
            throw exception;
        }
    }

    private void eliminarCuentaCompensatoria(String firebaseUid) {
        try {
            firebaseAuth.deleteUser(firebaseUid);
        } catch (FirebaseAuthException deleteException) {
            log.error("No se pudo compensar la cuenta Firebase {} tras un fallo de MySQL.",
                    firebaseUid, deleteException);
        }
    }

    private CrearUsuarioCommand normalizar(CrearUsuarioCommand command) {
        if (command == null) {
            throw new AdminUsuarioValidationException("El cuerpo de la solicitud es obligatorio.");
        }

        return new CrearUsuarioCommand(
                limpiar(command.nombres()),
                limpiar(command.apellidos()),
                command.correo() == null ? null : command.correo().trim().toLowerCase(Locale.ROOT),
                limpiarOpcional(command.telefono()),
                command.claveTemporal(),
                command.unidadId(),
                command.relacion() == null ? null : command.relacion().trim().toUpperCase(Locale.ROOT));
    }

    private void validar(CrearUsuarioCommand command) {
        if (isBlank(command.nombres()) || command.nombres().length() > 100) {
            throw new AdminUsuarioValidationException("Los nombres son obligatorios y no deben superar 100 caracteres.");
        }
        if (isBlank(command.apellidos()) || command.apellidos().length() > 120) {
            throw new AdminUsuarioValidationException("Los apellidos son obligatorios y no deben superar 120 caracteres.");
        }
        if (isBlank(command.correo()) || command.correo().length() > 150
                || !command.correo().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new AdminUsuarioValidationException("Ingresa un correo electrónico válido.");
        }
        if (command.telefono() != null && command.telefono().length() > 20) {
            throw new AdminUsuarioValidationException("El teléfono no debe superar 20 caracteres.");
        }
        if (isBlank(command.claveTemporal()) || command.claveTemporal().length() < 8
                || command.claveTemporal().length() > 128) {
            throw new AdminUsuarioValidationException("La clave temporal debe tener entre 8 y 128 caracteres.");
        }
        if (command.unidadId() == null || command.unidadId() <= 0) {
            throw new AdminUsuarioValidationException("Selecciona una unidad válida.");
        }
        if (!RELACIONES_VALIDAS.contains(command.relacion())) {
            throw new AdminUsuarioValidationException("La relación debe ser PROPIETARIO o INQUILINO.");
        }
    }

    private UsuarioView toUsuarioView(UsuarioPerfilEntity usuario, List<UsuarioUnidadEntity> relaciones) {
        List<UnidadView> unidades = relaciones.stream()
                .map(relacion -> toUnidadView(
                        relacion.getUnidad(), relacion.getRelacion(), relacion.getEsPrincipal()))
                .toList();

        return new UsuarioView(
                usuario.getId(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getCorreo(),
                usuario.getTelefono(),
                usuario.getRol() == null ? null : usuario.getRol().getCodigo(),
                Boolean.TRUE.equals(usuario.getActivo()),
                unidades);
    }

    private UnidadView toUnidadView(UnidadResidencialEntity unidad, String relacion, Boolean esPrincipal) {
        String torreCodigo = unidad.getTorre() == null ? null : unidad.getTorre().getCodigo();
        String torreNombre = unidad.getTorre() == null ? null : unidad.getTorre().getNombre();
        String etiqueta = (torreCodigo == null ? "" : torreCodigo + " - ")
                + "Dpto. " + unidad.getNumero() + " (piso " + unidad.getPiso() + ")";
        return new UnidadView(unidad.getId(), unidad.getPiso(), unidad.getNumero(),
                torreCodigo, torreNombre, etiqueta, relacion, esPrincipal);
    }

    private String limpiar(String value) {
        return value == null ? null : value.trim().replaceAll("\\s+", " ");
    }

    private String limpiarOpcional(String value) {
        String limpio = limpiar(value);
        return isBlank(limpio) ? null : limpio;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public record CrearUsuarioCommand(
            String nombres,
            String apellidos,
            String correo,
            String telefono,
            String claveTemporal,
            Long unidadId,
            String relacion) {
    }

    public record UsuarioView(
            Long id,
            String nombres,
            String apellidos,
            String correo,
            String telefono,
            String rol,
            Boolean activo,
            List<UnidadView> unidades) {
    }

    public record UnidadView(
            Long id,
            Integer piso,
            String numero,
            String torreCodigo,
            String torreNombre,
            String etiqueta,
            String relacion,
            Boolean esPrincipal) {
    }
}
