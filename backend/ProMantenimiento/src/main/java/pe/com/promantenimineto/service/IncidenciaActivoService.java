package pe.com.promantenimineto.service;

import java.time.LocalDateTime;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.com.promantenimineto.entity.*;
import pe.com.promantenimineto.repository.*;

@Service
public class IncidenciaActivoService {
    private final IncidenciaRepository incidencias;
    private final ActivoRepository activos;
    private final AuditoriaSistemaRepository auditoria;

    public IncidenciaActivoService(IncidenciaRepository incidencias, ActivoRepository activos,
            AuditoriaSistemaRepository auditoria) {
        this.incidencias = incidencias;
        this.activos = activos;
        this.auditoria = auditoria;
    }

    @Transactional
    public RelacionActivo asociar(Long incidenciaId, Long activoId) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof UsuarioPerfilEntity usuario)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión.");
        }
        if (!Boolean.TRUE.equals(usuario.getActivo()) || usuario.getRol() == null
                || !Boolean.TRUE.equals(usuario.getRol().getActivo())
                || !"ADMINISTRADOR".equals(usuario.getRol().getCodigo())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Solo administración puede relacionar una incidencia con un activo.");
        }
        if (activoId != null && activoId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El activo indicado no es válido.");
        }
        IncidenciaEntity incidencia = incidencias.findById(incidenciaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidencia no encontrada."));
        ActivoEntity activo = activoId == null ? null : activos.findById(activoId)
                .filter(a -> Boolean.TRUE.equals(a.getActivo()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "El activo no existe o está inactivo."));
        Long anterior = incidencia.getActivo() == null ? null : incidencia.getActivo().getId();
        if (!Objects.equals(anterior, activoId)) {
            var ahora = LocalDateTime.now();
            incidencia.setActivo(activo);
            incidencia.setActualizadoEn(ahora);
            incidencias.save(incidencia);
            auditoria.save(AuditoriaSistemaEntity.builder()
                    .usuario(usuario).accion("ASOCIAR_ACTIVO_INCIDENCIA").entidad("incidencia")
                    .entidadId(String.valueOf(incidenciaId))
                    .detalle("activoAnteriorId=" + anterior + ";activoNuevoId=" + activoId)
                    .creadoEn(ahora).build());
        }
        return new RelacionActivo(incidenciaId, activo == null ? null
                : new ActivoResumen(activo.getId(), activo.getCodigo(), activo.getNombre()));
    }

    public record ActivoResumen(Long id, String codigo, String nombre) {}
    public record RelacionActivo(Long incidenciaId, ActivoResumen activo) {}
}
