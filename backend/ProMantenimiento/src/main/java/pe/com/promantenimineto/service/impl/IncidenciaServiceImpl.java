package pe.com.promantenimineto.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.entity.EstadoIncidenciaEntity;
import pe.com.promantenimineto.entity.IncidenciaEntity;
import pe.com.promantenimineto.entity.UnidadResidencialEntity;
import pe.com.promantenimineto.repository.CategoriaIncidenciaRepository;
import pe.com.promantenimineto.repository.EstadoIncidenciaRepository;
import pe.com.promantenimineto.repository.IncidenciaRepository;
import pe.com.promantenimineto.repository.PrioridadIncidenciaRepository;
import pe.com.promantenimineto.repository.UnidadResidencialRepository;
import pe.com.promantenimineto.repository.UsuarioPerfilRepository;
import pe.com.promantenimineto.repository.UsuarioUnidadRepository;
import pe.com.promantenimineto.service.IncidenciaService;

@Service
public class IncidenciaServiceImpl implements IncidenciaService{

    @Autowired
    private IncidenciaRepository repositorio;
    
    @Autowired
    private CategoriaIncidenciaRepository categoriaRepositorio;

    @Autowired
    private PrioridadIncidenciaRepository prioridadRepositorio;

    @Autowired
    private EstadoIncidenciaRepository estadoRepositorio;
    
    @Autowired
    private UsuarioUnidadRepository usuarioUnidadRepository;
    
    @Autowired
    private UnidadResidencialRepository unidadResidencialRepository;
    
    @Autowired
    private UsuarioPerfilRepository usuarioPerfilRepository;
    
    
    private String generarCodigo() {
        int anio = LocalDate.now().getYear();
        int correlativo = repositorio.obtenerUltimoCorrelativo(anio) + 1;

        return String.format(
            Locale.ROOT,
            "INC-%d-%04d",
            anio,
            correlativo
        );
    }
    

    @Override
    public List<IncidenciaEntity> findAll() {
        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
            !authentication.isAuthenticated() ||
            !(authentication.getPrincipal()
                instanceof UsuarioPerfilEntity usuario)) {

            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Debes iniciar sesión."
            );
        }

        if (usuario.getRol() == null ||
            usuario.getRol().getCodigo() == null) {

            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "El usuario no tiene un rol válido."
            );
        }

        String rol = usuario.getRol().getCodigo();

        // El administrador puede consultar todas las incidencias.
        if ("ADMINISTRADOR".equals(rol)) {
            return repositorio.findAll();
        }

        // El residente solo consulta sus propias incidencias.
        if ("RESIDENTE".equals(rol)) {
            return repositorio.findBySolicitanteId(usuario.getId());
        }

        throw new ResponseStatusException(
            HttpStatus.FORBIDDEN,
            "No tienes permisos para consultar las incidencias."
        );
    }

    @Override
    public List<IncidenciaEntity> findAllCustom() {
        // Reutiliza las mismas reglas de autorización.
        return findAll();
    }


	@Override
	public IncidenciaEntity findById(Long id) {
	
	    Authentication authentication =
	        SecurityContextHolder.getContext().getAuthentication();
	
	    System.out.println("=== DEBUG INCIDENCIA ===");
	    System.out.println("Authentication: " + authentication);
	    System.out.println("Principal: " +
	        (authentication != null
	            ? authentication.getPrincipal().getClass().getName()
	            : "null"));
	
	    if (authentication == null
	            || !authentication.isAuthenticated()
	            || !(authentication.getPrincipal()
	                    instanceof UsuarioPerfilEntity usuario)) {
	        throw new ResponseStatusException(
	            HttpStatus.UNAUTHORIZED,
	            "No se pudo identificar al usuario autenticado."
	        );
	    }
	
	    if (usuario.getRol() == null
	            || usuario.getRol().getCodigo() == null) {
	        throw new ResponseStatusException(
	            HttpStatus.FORBIDDEN,
	            "El usuario no tiene un rol válido."
	        );
	    }
	
	    IncidenciaEntity incidencia = repositorio.findById(id)
	        .orElseThrow(() -> new ResponseStatusException(
	            HttpStatus.NOT_FOUND,
	            "Incidencia no encontrada"
	        ));
	
	    String rol = usuario.getRol().getCodigo();
	
	    // Administrador: puede consultar cualquier incidencia.
	    if ("ADMINISTRADOR".equals(rol)) {
	        return incidencia;
	    }
	
	    // Residente: solo puede consultar sus propias incidencias.
	    if ("RESIDENTE".equals(rol)) {
	
	        if (incidencia.getSolicitante() == null
	                || !incidencia.getSolicitante().getId()
	                    .equals(usuario.getId())) {
	            throw new ResponseStatusException(
	                HttpStatus.NOT_FOUND,
	                "Incidencia no encontrada"
	            );
	        }
	
	        return incidencia;
	    }
	
	    // Los demás roles requieren reglas específicas.
	    throw new ResponseStatusException(
	        HttpStatus.FORBIDDEN,
	        "No tienes permisos para consultar esta incidencia."
	    );
	}

    

    @Override
    public IncidenciaEntity add(IncidenciaEntity obj) {
		Authentication authentication =
		        SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication == null || !(authentication.getPrincipal() instanceof UsuarioPerfilEntity usuarioAutenticado)) {
		    throw new ResponseStatusException(
		            HttpStatus.UNAUTHORIZED,
		            "Debes iniciar sesión para registrar una incidencia."
		    );
		}
		
		// No confiamos en el ID recibido desde Postman o Angular.
		// El solicitante siempre será el usuario autenticado.
		obj.setSolicitante(usuarioAutenticado);

		if (usuarioAutenticado.getRol() == null
		        || usuarioAutenticado.getRol().getCodigo() == null) {
		    throw new ResponseStatusException(
		        HttpStatus.FORBIDDEN,
		        "El usuario no tiene un rol válido."
		    );
		}

		String rol = usuarioAutenticado.getRol().getCodigo();

		if (!"RESIDENTE".equals(rol) && !"ADMINISTRADOR".equals(rol)) {
		    throw new ResponseStatusException(
		        HttpStatus.FORBIDDEN,
		        "No tienes permisos para registrar incidencias."
		    );
		}

		// Validar que se haya seleccionado una unidad.
		if (obj.getUnidad() == null || obj.getUnidad().getId() == null) {
		    throw new ResponseStatusException(
		        HttpStatus.BAD_REQUEST,
		        "Debes seleccionar una unidad."
		    );
		}

		Long unidadId = obj.getUnidad().getId();

		// El residente solo puede reportar incidencias
		// en unidades vinculadas a su perfil.
		if ("RESIDENTE".equals(rol)) {
		    boolean tieneRelacion = usuarioUnidadRepository.existeRelacionActiva(
		        usuarioAutenticado.getId(),
		        unidadId
		    );

		    if (!tieneRelacion) {
		        throw new ResponseStatusException(
		            HttpStatus.FORBIDDEN,
		            "No puedes registrar incidencias para esta unidad."
		        );
		    }
		}

		// Buscar la unidad real en la base de datos.
		UnidadResidencialEntity unidad = unidadResidencialRepository
		    .findById(unidadId)
		    .orElseThrow(() -> new ResponseStatusException(
		        HttpStatus.BAD_REQUEST,
		        "La unidad indicada no existe."
		    ));

		obj.setUnidad(unidad);


    	 // Validar categoría
        if (obj.getCategoria() == null || obj.getCategoria().getId() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La categoría es obligatoria"
            );
        }

        // Validar prioridad
        if (obj.getPrioridad() == null || obj.getPrioridad().getId() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La prioridad es obligatoria"
            );
        }
        
        Long categoriaId = obj.getCategoria().getId();
        Long prioridadId = obj.getPrioridad().getId();

        // Asignar automáticamente el estado inicial (ID 1).
        EstadoIncidenciaEntity estadoInicial = estadoRepositorio.findById(1L)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "No se encontró el estado inicial de la incidencia."
            ));

        if (!Boolean.TRUE.equals(estadoInicial.getActivo())) {
            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "El estado inicial de la incidencia está inactivo."
            );
        }
        obj.setEstado(estadoInicial);
        
        obj.setCategoria(
            categoriaRepositorio.findById(categoriaId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La categoría indicada no existe"
                ))
        );

        obj.setPrioridad(
            prioridadRepositorio.findById(prioridadId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La prioridad indicada no existe"
                ))
        );
        

        // Completar fechas si no fueron enviadas
        LocalDateTime ahora = LocalDateTime.now();
        
        obj.setCodigo(generarCodigo());

        obj.setFechaReporte(ahora);
        obj.setCreadoEn(ahora);
        obj.setActualizadoEn(ahora);
        
        return repositorio.save(obj);
    }

    @Override
    public IncidenciaEntity update(IncidenciaEntity obj, Long id) {
        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal()
                    instanceof UsuarioPerfilEntity usuario)) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Debes iniciar sesión."
            );
        }

        if (usuario.getRol() == null
                || !"ADMINISTRADOR".equals(usuario.getRol().getCodigo())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Solo el administrador puede editar incidencias."
            );
        }

        IncidenciaEntity existente = repositorio.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Incidencia no encontrada"
            ));

        if (obj.getUbicacion() != null) {
            existente.setUbicacion(obj.getUbicacion());
        }

        if (obj.getDescripcion() != null) {
            existente.setDescripcion(obj.getDescripcion());
        }

        existente.setActualizadoEn(LocalDateTime.now());

        return repositorio.save(existente);
    }

    @Override
    public IncidenciaEntity delete(Long id) {
        return null;
    }

    @Override
    public IncidenciaEntity enable(Long id) {
        return null;
    }
}