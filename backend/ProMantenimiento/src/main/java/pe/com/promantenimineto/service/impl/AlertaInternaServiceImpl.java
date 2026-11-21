
package pe.com.promantenimineto.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pe.com.promantenimineto.entity.ActuacionAlertaInternaEntity;
import pe.com.promantenimineto.entity.AlertaInternaEntity;
import pe.com.promantenimineto.entity.EstadoAlertaInternaEntity;
import pe.com.promantenimineto.entity.TipoAlertaInternaEntity;
import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.repository.ActuacionAlertaInternaRepository;
import pe.com.promantenimineto.repository.AlertaInternaRepository;
import pe.com.promantenimineto.repository.EstadoAlertaInternaRepository;
import pe.com.promantenimineto.repository.TipoAlertaInternaRepository;
import pe.com.promantenimineto.service.AlertaInternaService;

@Service
@Transactional
public class AlertaInternaServiceImpl implements AlertaInternaService {

    @Autowired
    private AlertaInternaRepository repositorio;

    @Autowired
    private TipoAlertaInternaRepository tipoAlertaRepositorio;

    @Autowired
    private EstadoAlertaInternaRepository estadoAlertaRepositorio;
    
    @Autowired
    private ActuacionAlertaInternaRepository actuacionAlertaInternaRepositorio;
    

    @Override
    public AlertaInternaEntity findById(Long id) {

        UsuarioPerfilEntity usuario = obtenerUsuarioAutenticado();
        String rol = usuario.getRol().getCodigo();

        AlertaInternaEntity alerta = repositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró la alerta interna"
                ));

        // Validar permisos de consulta.
        if ("ADMINISTRADOR".equals(rol) || "PORTERIA_SEGURIDAD".equals(rol)) {

            // Puede consultar cualquier alerta.
        } else if ("RESIDENTE".equals(rol)) {
            if (!alerta.getResidente().getId().equals(usuario.getId())) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "No tienes permisos para consultar esta alerta"
                );
            }

        } else {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permisos para consultar alertas internas"
            );
        }

        // Obtener la última observación registrada.
        List<String> observaciones = actuacionAlertaInternaRepositorio.findUltimasObservaciones( id, PageRequest.of(0, 1) );
        alerta.setObservacion( observaciones.isEmpty() ? null : observaciones.get(0) );
        return alerta;
    }
    

    // Obtener al residente autenticado.
    private UsuarioPerfilEntity obtenerUsuarioAutenticado() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof UsuarioPerfilEntity usuario)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Debes iniciar sesión."
            );
        }

        return usuario;
    }

    // CA-01 y CA-02: Registrar alerta interna.
    @Override
    public AlertaInternaEntity emitir( Long tipoAlertaId, String ubicacion, String descripcion) {
        UsuarioPerfilEntity residente = obtenerUsuarioAutenticado();
        if (residente.getRol() == null || !"RESIDENTE".equals( residente.getRol().getCodigo())) {
            throw new ResponseStatusException( HttpStatus.FORBIDDEN, "Solo un residente puede emitir alertas internas." );
        }
        if (ubicacion == null || ubicacion.isBlank()) {
            throw new ResponseStatusException( HttpStatus.BAD_REQUEST, "Debes indicar la ubicación de la alerta." );
        }
        if (ubicacion.trim().length() > 255) {
            throw new ResponseStatusException( HttpStatus.BAD_REQUEST, "La ubicación no puede superar los 255 caracteres." );
        }
        if (tipoAlertaId == null) {
            throw new ResponseStatusException( HttpStatus.BAD_REQUEST, "Debes seleccionar un tipo de alerta." );
        }

        TipoAlertaInternaEntity tipoAlerta =
                tipoAlertaRepositorio.findById(tipoAlertaId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Tipo de alerta no encontrado."
                        ));

        if (!Boolean.TRUE.equals(tipoAlerta.getActivo())) {
            throw new ResponseStatusException( HttpStatus.BAD_REQUEST, "El tipo de alerta seleccionado no está activo." );
        }

        EstadoAlertaInternaEntity estadoEmitida = estadoAlertaRepositorio.findByCodigo("EMITIDA")
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "No existe el estado EMITIDA en el catálogo."
                        ));

        if (!Boolean.TRUE.equals(estadoEmitida.getActivo())) {
            throw new ResponseStatusException( HttpStatus.INTERNAL_SERVER_ERROR, "El estado EMITIDA se encuentra inactivo." );
        }

        LocalDateTime ahora = LocalDateTime.now();

        AlertaInternaEntity alerta = AlertaInternaEntity.builder()
                .residente(residente)
                .tipoAlerta(tipoAlerta)
                .estado(estadoEmitida)
                .ubicacion(ubicacion.trim())
                .descripcion( descripcion == null || descripcion.isBlank()
                                ? null
                                : descripcion.trim()
                )
                .fechaEmision(ahora)
                .actualizadoEn(ahora)
                .build();

        return repositorio.save(alerta);
    }

    // Consultar bandeja de administración y portería.
    @Override
    @Transactional(readOnly = true)
    public List<AlertaInternaEntity> findAllBandeja() {
        UsuarioPerfilEntity usuario = obtenerUsuarioAutenticado();

        if (usuario.getRol() == null) {
            throw new ResponseStatusException( HttpStatus.FORBIDDEN, "No tienes permisos para consultar las alertas." );
        }

        String rol = usuario.getRol().getCodigo();

        if (!"ADMINISTRADOR".equals(rol) && !"PORTERIA_SEGURIDAD".equals(rol)) {
            throw new ResponseStatusException( HttpStatus.FORBIDDEN, "Solo administración y portería pueden consultar la bandeja." );
        }

        return repositorio.findAllCustom();
    }

    // Consultar las alertas generadas por el residente autenticado.
    @Override
    @Transactional(readOnly = true)
    public List<AlertaInternaEntity> findByResidente() {

        UsuarioPerfilEntity residente = obtenerUsuarioAutenticado();

        if (residente.getRol() == null || !"RESIDENTE".equals( residente.getRol().getCodigo())) {
            throw new ResponseStatusException( HttpStatus.FORBIDDEN, "Solo un residente puede consultar su historial de alertas." );
        }

        return repositorio.findByResidenteIdOrderByFechaEmisionDesc(
                residente.getId()
        );
    }
    
    
    
    @Override
    public AlertaInternaEntity confirmarRecepcion(Long id) {

        UsuarioPerfilEntity portero = obtenerUsuarioAutenticado();

        // Validar que el usuario sea personal de portería.
        if (portero.getRol() == null
                || !"PORTERIA_SEGURIDAD".equals(portero.getRol().getCodigo())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Solo el personal de portería puede confirmar la recepción."
            );
        }

        // Buscar la alerta.
        AlertaInternaEntity alerta = repositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró la alerta interna."
                ));

        // CA-02: Evitar confirmaciones duplicadas.
        if ("RECIBIDA".equals(alerta.getEstado().getCodigo())) {
            return alerta;
        }

        // Validar que la alerta esté emitida.
        if (!"EMITIDA".equals(alerta.getEstado().getCodigo())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La alerta no se encuentra en estado EMITIDA."
            );
        }

        // Obtener el estado RECIBIDA.
        EstadoAlertaInternaEntity estadoRecibida =
                estadoAlertaRepositorio.findByCodigo("RECIBIDA")
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "No existe el estado RECIBIDA en el catálogo."
                        ));

        // Validar que el estado esté activo.
        if (!Boolean.TRUE.equals(estadoRecibida.getActivo())) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "El estado RECIBIDA se encuentra inactivo."
            );
        }

        // Registrar usuario y fecha de recepción.
        LocalDateTime ahora = LocalDateTime.now();

        alerta.setEstado(estadoRecibida);
        alerta.setRecibidoPor(portero);
        alerta.setFechaRecepcion(ahora);
        alerta.setActualizadoEn(ahora);

        return repositorio.save(alerta);
    }
    
    
    @Override
    @Transactional
    public AlertaInternaEntity actualizarEstado(Long id, String observacion) {

        // 1. Obtener usuario autenticado
        UsuarioPerfilEntity actor = obtenerUsuarioAutenticado();

        // 2. Validar que sea personal de portería o seguridad
        if (actor.getRol() == null || !"PORTERIA_SEGURIDAD".equals(actor.getRol().getCodigo())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Solo el personal de portería puede actualizar el estado de una alerta."
            );
        }

        // 3. Buscar la alerta
        AlertaInternaEntity alerta = repositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró la alerta."
                ));

        // 4. Determinar el siguiente estado permitido
        String estadoActual = alerta.getEstado().getCodigo();
        String nuevoCodigo;

        if ("RECIBIDA".equals(estadoActual)) {
            nuevoCodigo = "EN_ATENCION";
        } else if ("EN_ATENCION".equals(estadoActual)) {
            nuevoCodigo = "ATENDIDA";
        } else {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede actualizar una alerta que se encuentra en estado " + estadoActual + "."
            );
        }

        // 5. Buscar el nuevo estado
        EstadoAlertaInternaEntity estadoNuevo = estadoAlertaRepositorio
                .findByCodigo(nuevoCodigo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró el estado " + nuevoCodigo + "."
                ));

        if (!Boolean.TRUE.equals(estadoNuevo.getActivo())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El estado " + nuevoCodigo + " no se encuentra activo."
            );
        }

        // 6. Registrar la actuación
        LocalDateTime ahora = LocalDateTime.now();

        ActuacionAlertaInternaEntity actuacion = ActuacionAlertaInternaEntity.builder()
                .alerta(alerta)
                .actor(actor)
                .estadoAnterior(alerta.getEstado())
                .estadoNuevo(estadoNuevo)
                .observacion(observacion == null || observacion.isBlank()
                        ? null
                        : observacion.trim())
                .creadoEn(ahora)
                .build();

        actuacionAlertaInternaRepositorio.save(actuacion);

        // 7. Actualizar la alerta
        alerta.setEstado(estadoNuevo);
        alerta.setActualizadoEn(ahora);

        return repositorio.save(alerta);
    }
    
}
