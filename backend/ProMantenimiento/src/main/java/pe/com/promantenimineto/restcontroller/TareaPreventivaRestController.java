
package pe.com.promantenimineto.restcontroller;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import pe.com.promantenimineto.entity.IntervencionPreventivaEntity;
import pe.com.promantenimineto.entity.TareaPreventivaEntity;
import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.service.TareaPreventivaService;

@RestController
@RequestMapping("/api/tarea-preventiva")
public class TareaPreventivaRestController {

    @Autowired
    private TareaPreventivaService servicio;

    private UsuarioPerfilEntity obtenerUsuarioAutenticado() {
        Authentication autenticacion =
                SecurityContextHolder.getContext().getAuthentication();

        if (autenticacion == null
                || !(autenticacion.getPrincipal()
                        instanceof UsuarioPerfilEntity)) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "No se pudo identificar al usuario autenticado."
            );
        }

        return (UsuarioPerfilEntity) autenticacion.getPrincipal();
    }

    private String obtenerCodigoRol(UsuarioPerfilEntity usuario) {
        if (usuario.getRol() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "El usuario no tiene un rol asignado."
            );
        }

        return usuario.getRol().getCodigo();
    }

    @GetMapping
    public List<TareaPreventivaEntity> findAll() {
        UsuarioPerfilEntity usuario = obtenerUsuarioAutenticado();
        String rol = obtenerCodigoRol(usuario);

        if ("ADMIN".equals(rol)) {
            return servicio.findAll();
        }

        if ("MANTENIMIENTO".equals(rol)) {
            return servicio.findByResponsableId(usuario.getId());
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No tienes permisos para consultar estas tareas."
        );
    }

    @GetMapping("/custom")
    public List<TareaPreventivaEntity> findAllCustom() {
        UsuarioPerfilEntity usuario = obtenerUsuarioAutenticado();
        String rol = obtenerCodigoRol(usuario);

        if ("ADMIN".equals(rol)) {
            return servicio.findAllCustom();
        }

        if ("MANTENIMIENTO".equals(rol)) {
            return servicio.findByResponsableId(usuario.getId());
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No tienes permisos para consultar estas tareas."
        );
    }

    @GetMapping("/asignadas")
    public List<TareaPreventivaEntity> findAsignadas() {
        UsuarioPerfilEntity usuario = obtenerUsuarioAutenticado();

        if (!"MANTENIMIENTO".equals(obtenerCodigoRol(usuario))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Este endpoint es exclusivo del personal de mantenimiento."
            );
        }

        return servicio.findByResponsableId(usuario.getId());
    }

    @GetMapping("/{id}")
    public TareaPreventivaEntity findById(@PathVariable Long id) {
        UsuarioPerfilEntity usuario = obtenerUsuarioAutenticado();
        String rol = obtenerCodigoRol(usuario);

        TareaPreventivaEntity tarea = servicio.findById(id);

        if ("ADMIN".equals(rol)) {
            return tarea;
        }

        if ("MANTENIMIENTO".equals(rol)
                && tarea.getResponsable() != null
                && usuario.getId().equals(
                        tarea.getResponsable().getId())) {
            return tarea;
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "No tienes permiso para consultar esta tarea."
        );
    }

    @PostMapping
    public TareaPreventivaEntity add(
            @RequestBody TareaPreventivaEntity obj) {
        return servicio.add(obj);
    }

    @PutMapping("{id}")
    public TareaPreventivaEntity update(
            @RequestBody TareaPreventivaEntity obj,
            @PathVariable Long id) {
        return servicio.update(obj, id);
    }

    @DeleteMapping("{id}")
    public TareaPreventivaEntity delete(@PathVariable Long id) {
        return servicio.delete(id);
    }

    @PatchMapping("{id}")
    public TareaPreventivaEntity enable(@PathVariable Long id) {
        return servicio.enable(id);
    }
    
    @PatchMapping("/{id}/iniciar-atencion")
    public TareaPreventivaEntity iniciarAtencion(@PathVariable Long id) {

        UsuarioPerfilEntity usuario = obtenerUsuarioAutenticado();

        if (!"MANTENIMIENTO".equals(obtenerCodigoRol(usuario))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Solo el personal de mantenimiento puede iniciar una tarea."
            );
        }

        return servicio.iniciarAtencion(id, usuario.getId());
    }
    
    @PostMapping( value = "/{id}/registrar-intervencion", consumes = MediaType.MULTIPART_FORM_DATA_VALUE )
	public IntervencionPreventivaEntity registrarIntervencion(

	        @PathVariable Long id,

	        @RequestParam
	        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
	        LocalDateTime fechaEjecucion,

	        @RequestParam(required = false)
	        String observaciones,

	        @RequestParam
	        String accionesRealizadas,

	        @RequestParam(required = false)
	        List<MultipartFile> archivos) {

	    UsuarioPerfilEntity usuario = obtenerUsuarioAutenticado();

	    if (!"MANTENIMIENTO".equals(obtenerCodigoRol(usuario))) {
	        throw new ResponseStatusException(
	                HttpStatus.FORBIDDEN,
	                "Solo el personal de mantenimiento puede registrar una intervención."
	        );
	    }

	    return servicio.registrarIntervencion(
	            id,
	            usuario.getId(),
	            fechaEjecucion,
	            observaciones,
	            accionesRealizadas,
	            archivos
	    );
	}
    
    
}
