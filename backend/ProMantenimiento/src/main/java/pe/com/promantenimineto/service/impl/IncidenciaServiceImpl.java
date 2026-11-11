package pe.com.promantenimineto.service.impl;

import java.util.ArrayList;
import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.entity.UsuarioUnidadEntity;
import pe.com.promantenimineto.entity.ActuacionIncidenciaEntity;
import pe.com.promantenimineto.entity.AsignacionIncidenciaEntity;
import pe.com.promantenimineto.entity.CategoriaIncidenciaEntity;
import pe.com.promantenimineto.entity.EstadoIncidenciaEntity;
import pe.com.promantenimineto.entity.EvidenciaIncidenciaEntity;
import pe.com.promantenimineto.entity.IncidenciaEntity;
import pe.com.promantenimineto.entity.PrioridadIncidenciaEntity;
import pe.com.promantenimineto.entity.TipoAccionIncidenciaEntity;
import pe.com.promantenimineto.entity.TipoEvidenciaEntity;
import pe.com.promantenimineto.entity.UnidadResidencialEntity;
import pe.com.promantenimineto.repository.ActuacionIncidenciaRepository;
import pe.com.promantenimineto.repository.AsignacionIncidenciaRepository;
import pe.com.promantenimineto.repository.CategoriaIncidenciaRepository;
import pe.com.promantenimineto.repository.EstadoIncidenciaRepository;
import pe.com.promantenimineto.repository.EvidenciaIncidenciaRepository;
import pe.com.promantenimineto.repository.IncidenciaRepository;
import pe.com.promantenimineto.repository.PrioridadIncidenciaRepository;
import pe.com.promantenimineto.repository.TipoAccionIncidenciaRepository;
import pe.com.promantenimineto.repository.TipoEvidenciaRepository;
import pe.com.promantenimineto.repository.UnidadResidencialRepository;
import pe.com.promantenimineto.repository.UsuarioPerfilRepository;
import pe.com.promantenimineto.repository.UsuarioUnidadRepository;
import pe.com.promantenimineto.service.EvidenciaArchivoService;
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
    private EvidenciaIncidenciaRepository evidenciaRepositorio;

    @Autowired
    private TipoEvidenciaRepository tipoEvidenciaRepositorio;

    @Autowired
    private EvidenciaArchivoService evidenciaArchivoService;
    
    @Autowired
    private ActuacionIncidenciaRepository actuacionRepositorio;

    @Autowired
    private TipoAccionIncidenciaRepository tipoAccionRepositorio;
    
    @Autowired
    private UsuarioPerfilRepository usuarioPerfilRepositorio;    
    
    @Autowired
    private AsignacionIncidenciaRepository asignacionRepositorio;
    
    
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
	    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
	
	    if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal()
	            instanceof UsuarioPerfilEntity usuario)) {
	
	        throw new ResponseStatusException(
	            HttpStatus.UNAUTHORIZED,
	            "Debes iniciar sesión."
	        );
	    }
	
	    if (usuario.getRol() == null || usuario.getRol().getCodigo() == null) {	
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
	
	    // El residente consulta únicamente sus incidencias reportadas.
	    if ("RESIDENTE".equals(rol)) {
	        return repositorio.findBySolicitanteId(usuario.getId());
	    }
	
	    // Mantenimiento y seguridad consultan las incidencias
	    // que ellos mismos reportaron.
	    if ("MANTENIMIENTO".equals(rol) || "PORTERIA_SEGURIDAD".equals(rol)) {
	
	        return repositorio.findBySolicitanteId(usuario.getId());
	    }
	
	    throw new ResponseStatusException(
	        HttpStatus.FORBIDDEN,
	        "No tienes permisos para consultar las incidencias."
	    );
	}
	
	

	@Override
	public List<IncidenciaEntity> findIncidenciasAsignadas() {
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
	
	    if (!"MANTENIMIENTO".equals(rol) &&
	        !"PORTERIA_SEGURIDAD".equals(rol)) {
	
	        throw new ResponseStatusException(
	            HttpStatus.FORBIDDEN,
	            "Solo Mantenimiento y Portería/Seguridad pueden consultar sus incidencias asignadas."
	        );
	    }
	
	    return repositorio.findByResponsableActualId(usuario.getId());
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
	    

	    // Portería y mantenimiento: solo pueden consultar
	    // incidencias que tengan asignadas actualmente.
	    if ("PORTERIA_SEGURIDAD".equals(rol)
	            || "MANTENIMIENTO".equals(rol)) {

	        if (incidencia.getResponsableActual() == null
	                || !incidencia.getResponsableActual().getId()
	                    .equals(usuario.getId())) {

	            throw new ResponseStatusException(
	                HttpStatus.FORBIDDEN,
	                "La incidencia no te corresponde. Actualmente está asignada a otro personal."
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
	
	    if (authentication == null
	            || !authentication.isAuthenticated()
	            || !(authentication.getPrincipal()
	                    instanceof UsuarioPerfilEntity usuarioAutenticado)) {
	        throw new ResponseStatusException(
	                HttpStatus.UNAUTHORIZED,
	                "Debes iniciar sesión para reportar una incidencia."
	        );
	    }
	
	    if (obj == null) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "Los datos de la incidencia son obligatorios."
	        );
	    }
	
	    if (usuarioAutenticado.getRol() == null
	            || usuarioAutenticado.getRol().getCodigo() == null) {
	        throw new ResponseStatusException(
	                HttpStatus.FORBIDDEN,
	                "El usuario no tiene un rol válido."
	        );
	    }
	
	    String rol = usuarioAutenticado.getRol().getCodigo();
	
	    if (!"RESIDENTE".equals(rol)
	            && !"ADMINISTRADOR".equals(rol)
	            && !"MANTENIMIENTO".equals(rol)
	            && !"PORTERIA_SEGURIDAD".equals(rol)) {
	        throw new ResponseStatusException(
	                HttpStatus.FORBIDDEN,
	                "No tienes permisos para registrar incidencias."
	        );
	    }
	
	    // El solicitante siempre es el usuario autenticado.
	    obj.setSolicitante(usuarioAutenticado);
	
	    // 1. Determinar la unidad según el rol.
	    if ("RESIDENTE".equals(rol)) {
	
	        List<UsuarioUnidadEntity> relaciones =
	                usuarioUnidadRepository.findUnidadPrincipalActiva(
	                        usuarioAutenticado.getId()
	                );
	
	        if (relaciones.isEmpty()) {
	            throw new ResponseStatusException(
	                    HttpStatus.BAD_REQUEST,
	                    "No tienes una unidad principal activa asociada."
	            );
	        }
	
	        if (relaciones.size() > 1) {
	            throw new ResponseStatusException(
	                    HttpStatus.CONFLICT,
	                    "Tienes más de una unidad principal activa. Contacta al administrador."
	            );
	        }
	
	        obj.setUnidad(relaciones.get(0).getUnidad());
	
	    } else if ("ADMINISTRADOR".equals(rol)) {
	
	        // La unidad es opcional para el administrador.
	        if (obj.getUnidad() != null
	                && obj.getUnidad().getId() != null) {
	
	            UnidadResidencialEntity unidad =
	                    unidadResidencialRepository.findById(
	                            obj.getUnidad().getId()
	                    ).orElseThrow(() -> new ResponseStatusException(
	                            HttpStatus.BAD_REQUEST,
	                            "La unidad indicada no existe."
	                    ));
	
	            obj.setUnidad(unidad);
	
	        } else {
	            obj.setUnidad(null);
	        }
	
	    } else {
	        // Portería y mantenimiento no tienen unidad residencial propia.
	        obj.setUnidad(null);
	    }
	
	    // 2. Validar la categoría.
	    if (obj.getCategoria() == null
	            || obj.getCategoria().getId() == null) {
	        throw new ResponseStatusException(
	                HttpStatus.BAD_REQUEST,
	                "La categoría es obligatoria."
	        );
	    }
	
	    CategoriaIncidenciaEntity categoria =
	            categoriaRepositorio.findById(
	                    obj.getCategoria().getId()
	            ).orElseThrow(() -> new ResponseStatusException(
	                    HttpStatus.BAD_REQUEST,
	                    "La categoría indicada no existe."
	            ));
	
	    obj.setCategoria(categoria);
	
	    // 3. Asignar la prioridad predeterminada.
	    PrioridadIncidenciaEntity prioridad =
	            prioridadRepositorio.findById(1L)
	                    .orElseThrow(() -> new ResponseStatusException(
	                            HttpStatus.INTERNAL_SERVER_ERROR,
	                            "No existe la prioridad predeterminada."
	                    ));
	
	    obj.setPrioridad(prioridad);
	
	    // 4. Asignar el estado inicial.
	    EstadoIncidenciaEntity estado =
	            estadoRepositorio.findById(1L)
	                    .orElseThrow(() -> new ResponseStatusException(
	                            HttpStatus.INTERNAL_SERVER_ERROR,
	                            "No existe el estado inicial de las incidencias."
	                    ));
	
	    if (!Boolean.TRUE.equals(estado.getActivo())) {
	        throw new ResponseStatusException(
	                HttpStatus.INTERNAL_SERVER_ERROR,
	                "El estado inicial de las incidencias está inactivo."
	        );
	    }
	
	    obj.setEstado(estado);
	
	    // 5. Generar código y fechas.
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
    
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public IncidenciaEntity addWithEvidencias(
            IncidenciaEntity obj,
            List<MultipartFile> archivos) {

        List<String> rutasGuardadas = new ArrayList<>();

        try {
            // Validar cantidad de archivos.
            if (archivos != null && archivos.size() > 3) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Solo puedes adjuntar un máximo de 3 evidencias."
                );
            }

            // Validar que no se envíen elementos vacíos.
            if (archivos != null) {
                for (MultipartFile archivo : archivos) {
                    if (archivo == null || archivo.isEmpty()) {
                        throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "No puedes adjuntar archivos vacíos."
                        );
                    }
                }
            }

            // Reutilizar la lógica existente de registro.
            IncidenciaEntity incidencia = add(obj);

            if (archivos == null || archivos.isEmpty()) {
                return incidencia;
            }

            // Obtener el usuario autenticado como autor.
            Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null
                    || !(authentication.getPrincipal()
                        instanceof UsuarioPerfilEntity autor)) {
                throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "No se pudo identificar al autor de las evidencias."
                );
            }

            for (MultipartFile archivo : archivos) {
				String mime = archivo.getContentType();
				String nombre = archivo.getOriginalFilename();
				
				if (mime == null || nombre == null || nombre.isBlank()) {
				    throw new ResponseStatusException(
				            HttpStatus.BAD_REQUEST,
				            "No se pudo identificar el tipo de archivo."
				    );
				}
				
				String extension = nombre.substring( nombre.lastIndexOf('.') + 1 ).toLowerCase(java.util.Locale.ROOT);				
				String codigoTipo;
				
				boolean esImagenPermitida =
				        ("image/jpeg".equalsIgnoreCase(mime) && ("jpg".equals(extension) || "jpeg".equals(extension)))
				        || ("image/png".equalsIgnoreCase(mime) && "png".equals(extension))
				        || ("image/webp".equalsIgnoreCase(mime) && "webp".equals(extension));
				
				boolean esPdfPermitido = "application/pdf".equalsIgnoreCase(mime) && "pdf".equals(extension);
				
				if (esImagenPermitida) {
				    codigoTipo = "FOTO";
				} else if (esPdfPermitido) {
				    codigoTipo = "DOCUMENTO";
				} else {
				    throw new ResponseStatusException(
				            HttpStatus.BAD_REQUEST,
				            "Solo se permiten imágenes JPG, JPEG, PNG, WebP y documentos PDF."
				    );
				}


                TipoEvidenciaEntity tipo = tipoEvidenciaRepositorio
                        .findByCodigoAndActivoTrue(codigoTipo)
                        .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "No existe un tipo de evidencia activo: "
                                + codigoTipo
                        ));

                // Guardar físicamente el archivo.
                String ruta = evidenciaArchivoService.guardar(
                    archivo,
                    incidencia.getCodigo()
                );

                rutasGuardadas.add(ruta);

                // Registrar los metadatos en MySQL.
                EvidenciaIncidenciaEntity evidencia =
                    new EvidenciaIncidenciaEntity();

                evidencia.setIncidencia(incidencia);
                evidencia.setAutor(autor);
                evidencia.setTipoEvidencia(tipo);
                evidencia.setNombreArchivo(
                    Path.of(ruta).getFileName().toString()
                );
                evidencia.setUrlRecurso(ruta);
                evidencia.setCreadoEn(LocalDateTime.now());

                evidenciaRepositorio.save(evidencia);
            }

            return incidencia;

        } catch (Exception e) {

            // Intentar limpiar los archivos ya almacenados.
            for (String ruta : rutasGuardadas) {
                try {
                    evidenciaArchivoService.eliminar(ruta);
                } catch (IOException errorLimpieza) {
                    e.addSuppressed(errorLimpieza);
                }
            }

            if (e instanceof ResponseStatusException errorHttp) {
                throw errorHttp;
            }

            if (e instanceof IllegalArgumentException errorValidacion) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    errorValidacion.getMessage(),
                    errorValidacion
                );
            }

            throw new ResponseStatusException(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "No se pudo registrar la incidencia con sus evidencias.",
                e
            );
        }
    }
    
    
    @Override
    @Transactional
    public IncidenciaEntity clasificar(IncidenciaEntity obj, Long id) {

        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || !(authentication.getPrincipal()
                    instanceof UsuarioPerfilEntity administrador)) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Debes iniciar sesión."
            );
        }

        if (administrador.getRol() == null
                || !"ADMINISTRADOR".equals(
                    administrador.getRol().getCodigo())) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Solo el administrador puede clasificar incidencias."
            );
        }

        // CA-02: validar los campos obligatorios.
        if (obj == null
                || obj.getCategoria() == null
                || obj.getCategoria().getId() == null
                || obj.getPrioridad() == null
                || obj.getPrioridad().getId() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La categoría y la prioridad son obligatorias."
            );
        }

        IncidenciaEntity existente = repositorio.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Incidencia no encontrada."
            ));

        // Solo se clasifican incidencias reportadas.
        if (existente.getEstado() == null
                || !"REPORTADA".equals(
                    existente.getEstado().getCodigo())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Solo se pueden clasificar incidencias en estado REPORTADA."
            );
        }
     // Validar que se haya seleccionado un responsable.
        if (obj.getResponsableActual() == null
                || obj.getResponsableActual().getId() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Debes seleccionar un responsable."
            );
        }

        Long responsableId = obj.getResponsableActual().getId();

        UsuarioPerfilEntity responsable =
            usuarioPerfilRepositorio.findById(responsableId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El responsable seleccionado no existe."
                ));

        // Solo permitir usuarios activos.
        if (!Boolean.TRUE.equals(responsable.getActivo())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El responsable seleccionado está inactivo."
            );
        }

        // Solo permitir los roles autorizados.
        if (responsable.getRol() == null
                || !Boolean.TRUE.equals(responsable.getRol().getActivo())
                || !(
                    "MANTENIMIENTO".equals(
                        responsable.getRol().getCodigo())
                    || "PORTERIA_SEGURIDAD".equals(
                        responsable.getRol().getCodigo())
                )) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El usuario seleccionado no tiene un rol autorizado para recibir incidencias."
            );
        }
        

        Long categoriaId = obj.getCategoria().getId();
        Long prioridadId = obj.getPrioridad().getId();

        CategoriaIncidenciaEntity categoria = categoriaRepositorio.findById(categoriaId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La categoría indicada no existe."
                ));

        	PrioridadIncidenciaEntity prioridad = prioridadRepositorio.findById(prioridadId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La prioridad indicada no existe."
                ));
        	
        	EstadoIncidenciaEntity estadoAsignada =
        			estadoRepositorio.findByCodigo("ASIGNADA")
        		        .orElseThrow(() -> new ResponseStatusException(
        		            HttpStatus.INTERNAL_SERVER_ERROR,
        		            "No existe el estado ASIGNADA."
        		        ));
        
        	TipoAccionIncidenciaEntity tipoAccion = tipoAccionRepositorio
        	    .findByCodigo("CLASIFICACION")
        	    .orElseThrow(() -> new ResponseStatusException(	
        	        HttpStatus.INTERNAL_SERVER_ERROR,
        	        "No existe el tipo de acción CLASIFICACION."
        	    ));

        	ActuacionIncidenciaEntity actuacion =
        	    ActuacionIncidenciaEntity.builder()
        	        .incidencia(existente)
        	        .actor(administrador)
        	        .tipoAccion(tipoAccion)
        	        .descripcion("Clasificación de incidencia. Categoría: "
        	            + categoria.getNombre()
        	            + ", prioridad: " + prioridad.getNombre())
        	        .estadoAnterior(existente.getEstado())
        	        .estadoNuevo(estadoAsignada)
        	        .creadoEn(LocalDateTime.now())
        	        .build();

        	actuacionRepositorio.save(actuacion);

        	// Actualizar la incidencia.
        	existente.setCategoria(categoria);
        	existente.setPrioridad(prioridad);
        	existente.setResponsableActual(responsable);
        	existente.setEstado(estadoAsignada);
        	existente.setActualizadoEn(LocalDateTime.now());

        	IncidenciaEntity incidenciaGuardada = repositorio.save(existente);

        	// Registrar la asignación en el historial.
        	AsignacionIncidenciaEntity asignacion = new AsignacionIncidenciaEntity();

        	asignacion.setIncidencia(incidenciaGuardada);
        	asignacion.setAsignadoPor(administrador);
        	asignacion.setResponsableUsuario(responsable);
        	asignacion.setObservacion("Asignación realizada durante la clasificación de la incidencia.");

        	// Inicializar la fecha obligatoria antes de guardar.
        	asignacion.setAsignadoEn(LocalDateTime.now());

        	asignacionRepositorio.save(asignacion);

        	return incidenciaGuardada;
    }
    
    

	@Override
	@Transactional
	public IncidenciaEntity aceptar(Long id) {
	
	    Authentication authentication =
	        SecurityContextHolder.getContext().getAuthentication();
	
	    if (authentication == null
	            || !authentication.isAuthenticated()
	            || !(authentication.getPrincipal()
	                instanceof UsuarioPerfilEntity tecnico)) {
	        throw new ResponseStatusException(
	            HttpStatus.UNAUTHORIZED,
	            "Debes iniciar sesión."
	        );
	    }
	

		String rolCodigo = tecnico.getRol() != null
		        ? tecnico.getRol().getCodigo()
		        : null;
		
		if (!"MANTENIMIENTO".equals(rolCodigo)
		        && !"PORTERIA_SEGURIDAD".equals(rolCodigo)) {
		    throw new ResponseStatusException(
		        HttpStatus.FORBIDDEN,
		        "Solo el personal de mantenimiento o portería puede aceptar la incidencia."
		    );
		}

	
	    IncidenciaEntity incidencia = repositorio.findById(id)
	        .orElseThrow(() -> new ResponseStatusException(
	            HttpStatus.NOT_FOUND,
	            "Incidencia no encontrada."
	        ));
	
	    // CA-02: comprobar que la incidencia esté asignada al técnico autenticado.
	    if (incidencia.getResponsableActual() == null
	            || !tecnico.getId().equals(
	                incidencia.getResponsableActual().getId())) {
	        throw new ResponseStatusException(
	            HttpStatus.FORBIDDEN,
	            "No puedes aceptar una incidencia que no está asignada a tu usuario."
	        );
	    }
	
	    // Solo se pueden aceptar incidencias en estado ASIGNADA.
	    if (incidencia.getEstado() == null
	            || !"ASIGNADA".equals(incidencia.getEstado().getCodigo())) {
	        throw new ResponseStatusException(
	            HttpStatus.CONFLICT,
	            "La incidencia no se encuentra en estado ASIGNADA."
	        );
	    }
	
	    EstadoIncidenciaEntity estadoEnAtencion =
	        estadoRepositorio.findByCodigo("EN_ATENCION")
	            .orElseThrow(() -> new ResponseStatusException(
	                HttpStatus.INTERNAL_SERVER_ERROR,
	                "No existe el estado EN_ATENCION."
	            ));
	
	    TipoAccionIncidenciaEntity tipoAceptacion =
	        tipoAccionRepositorio.findByCodigo("ACEPTACION")
	            .orElseThrow(() -> new ResponseStatusException(
	                HttpStatus.INTERNAL_SERVER_ERROR,
	                "No existe el tipo de acción ACEPTACION."
	            ));
	
	    EstadoIncidenciaEntity estadoAnterior = incidencia.getEstado();
	    LocalDateTime ahora = LocalDateTime.now();
	
	    // Registrar la aceptación del técnico.
	    ActuacionIncidenciaEntity actuacion =
	        ActuacionIncidenciaEntity.builder()
	            .incidencia(incidencia)
	            .actor(tecnico)
	            .tipoAccion(tipoAceptacion)
	            .descripcion("El técnico aceptó la atención de la incidencia.")
	            .estadoAnterior(estadoAnterior)
	            .estadoNuevo(estadoEnAtencion)
	            .creadoEn(ahora)
	            .build();
	
	    actuacionRepositorio.save(actuacion);
	
	    // Actualizar el estado de la incidencia.
	    incidencia.setEstado(estadoEnAtencion);
	    incidencia.setActualizadoEn(ahora);
	
	    return repositorio.save(incidencia);
	}
	

	@Override
	@Transactional(rollbackFor = Exception.class)
	public IncidenciaEntity finalizarAtencion(
	        Long id,
	        String diagnosticoTecnico,
	        String accionesRealizadas,
	        List<MultipartFile> archivos) {

	    List<String> rutasGuardadas = new ArrayList<>();

	    try {

	        // 1. Obtener el usuario autenticado
	        Object principal = SecurityContextHolder.getContext()
	                .getAuthentication()
	                .getPrincipal();

	        if (!(principal instanceof UsuarioPerfilEntity tecnico)) {
	            throw new ResponseStatusException(
	                    HttpStatus.UNAUTHORIZED,
	                    "Debes iniciar sesión."
	            );
	        }

	        // 2. Validar rol
	        String rol = tecnico.getRol().getCodigo();

	        if (!rol.equals("MANTENIMIENTO")
	                && !rol.equals("PORTERIA_SEGURIDAD")) {
	            throw new ResponseStatusException(
	                    HttpStatus.FORBIDDEN,
	                    "No tienes permisos para finalizar esta atención."
	            );
	        }

	        // 3. Buscar incidencia
	        IncidenciaEntity incidencia = repositorio.findById(id)
	                .orElseThrow(() -> new ResponseStatusException(
	                        HttpStatus.NOT_FOUND,
	                        "Incidencia no encontrada."
	                ));

	        // 4. Verificar responsable
	        if (incidencia.getResponsableActual() == null
	                || !incidencia.getResponsableActual().getId()
	                        .equals(tecnico.getId())) {
	            throw new ResponseStatusException(
	                    HttpStatus.FORBIDDEN,
	                    "La incidencia no está asignada a tu usuario."
	            );
	        }

	        // 5. Validar estado actual
	        if (!"EN_ATENCION".equals(
	                incidencia.getEstado().getCodigo())) {
	            throw new ResponseStatusException(
	                    HttpStatus.CONFLICT,
	                    "La incidencia debe estar en estado EN_ATENCION."
	            );
	        }

	        // 6. Validar acciones realizadas
	        if (accionesRealizadas == null
	                || accionesRealizadas.isBlank()) {
	            throw new ResponseStatusException(
	                    HttpStatus.BAD_REQUEST,
	                    "Las acciones realizadas son obligatorias."
	            );
	        }

	        // 7. Validar cantidad de archivos
	        if (archivos != null && archivos.size() > 3) {
	            throw new ResponseStatusException(
	                    HttpStatus.BAD_REQUEST,
	                    "Solo puedes adjuntar un máximo de 3 evidencias."
	            );
	        }

	        // 8. Validar archivos vacíos antes de guardarlos
	        if (archivos != null) {
	            for (MultipartFile archivo : archivos) {
	                if (archivo == null || archivo.isEmpty()) {
	                    throw new ResponseStatusException(
	                            HttpStatus.BAD_REQUEST,
	                            "No puedes adjuntar archivos vacíos."
	                    );
	                }
	            }
	        }

	        EstadoIncidenciaEntity estadoAnterior =
	                incidencia.getEstado();

	        EstadoIncidenciaEntity estadoSolucionada =
	                estadoRepositorio.findByCodigo("SOLUCIONADA")
	                        .orElseThrow(() -> new ResponseStatusException(
	                                HttpStatus.INTERNAL_SERVER_ERROR,
	                                "No existe el estado SOLUCIONADA en el catálogo."
	                        ));

	        TipoAccionIncidenciaEntity tipoDiagnostico =
	                tipoAccionRepositorio.findByCodigo("DIAGNOSTICO")
	                        .orElseThrow(() -> new ResponseStatusException(
	                                HttpStatus.INTERNAL_SERVER_ERROR,
	                                "No existe el tipo de acción DIAGNOSTICO."
	                        ));

	        TipoAccionIncidenciaEntity tipoAccionRealizada =
	                tipoAccionRepositorio.findByCodigo("ACCION_REALIZADA")
	                        .orElseThrow(() -> new ResponseStatusException(
	                                HttpStatus.INTERNAL_SERVER_ERROR,
	                                "No existe el tipo de acción ACCION_REALIZADA."
	                        ));

	        TipoAccionIncidenciaEntity tipoSolucion =
	                tipoAccionRepositorio.findByCodigo("SOLUCION")
	                        .orElseThrow(() -> new ResponseStatusException(
	                                HttpStatus.INTERNAL_SERVER_ERROR,
	                                "No existe el tipo de acción SOLUCION."
	                        ));

	        // 9. Guardar las evidencias de la solución
	        if (archivos != null && !archivos.isEmpty()) {

	            for (MultipartFile archivo : archivos) {

	                String mime = archivo.getContentType();
	                String codigoTipo;

	                if (mime != null && mime.startsWith("image/")) {
	                    codigoTipo = "FOTO";
	                } else if (mime != null && mime.startsWith("video/")) {
	                    codigoTipo = "VIDEO";
	                } else {
	                    throw new ResponseStatusException(
	                            HttpStatus.BAD_REQUEST,
	                            "Solo se permiten imágenes y videos."
	                    );
	                }

	                TipoEvidenciaEntity tipo =
	                        tipoEvidenciaRepositorio
	                                .findByCodigoAndActivoTrue(codigoTipo)
	                                .orElseThrow(() -> new ResponseStatusException(
	                                        HttpStatus.INTERNAL_SERVER_ERROR,
	                                        "No existe un tipo de evidencia activo: "
	                                                + codigoTipo
	                                ));

	                // Guardar físicamente el archivo
	                String ruta = evidenciaArchivoService.guardar(
	                        archivo,
	                        incidencia.getCodigo()
	                );

	                rutasGuardadas.add(ruta);

	                // Guardar los metadatos en MySQL
	                EvidenciaIncidenciaEntity evidencia =
	                        new EvidenciaIncidenciaEntity();

	                evidencia.setIncidencia(incidencia);
	                evidencia.setAutor(tecnico);
	                evidencia.setTipoEvidencia(tipo);

	                evidencia.setNombreArchivo(
	                        Path.of(ruta).getFileName().toString()
	                );

	                evidencia.setUrlRecurso(ruta);

	                // Identifica que la evidencia corresponde a la solución
	                evidencia.setDescripcion("Evidencia de solución");

	                // La evidencia se registra antes del cambio a SOLUCIONADA
	                evidencia.setCreadoEn(LocalDateTime.now());

	                evidenciaRepositorio.save(evidencia);
	            }
	        }

	        // 10. Registrar las actuaciones después de guardar las evidencias
	        LocalDateTime ahora = LocalDateTime.now();

	        if (diagnosticoTecnico != null
	                && !diagnosticoTecnico.isBlank()) {

	            actuacionRepositorio.save(
	                    ActuacionIncidenciaEntity.builder()
	                            .incidencia(incidencia)
	                            .actor(tecnico)
	                            .tipoAccion(tipoDiagnostico)
	                            .descripcion(diagnosticoTecnico.trim())
	                            .estadoAnterior(estadoAnterior)
	                            .estadoNuevo(estadoAnterior)
	                            .creadoEn(ahora)
	                            .build()
	            );
	        }

	        actuacionRepositorio.save(
	                ActuacionIncidenciaEntity.builder()
	                        .incidencia(incidencia)
	                        .actor(tecnico)
	                        .tipoAccion(tipoAccionRealizada)
	                        .descripcion(accionesRealizadas.trim())
	                        .estadoAnterior(estadoAnterior)
	                        .estadoNuevo(estadoAnterior)
	                        .creadoEn(ahora)
	                        .build()
	        );

	        // 11. Registrar la solución y el cambio de estado
	        actuacionRepositorio.save(
	                ActuacionIncidenciaEntity.builder()
	                        .incidencia(incidencia)
	                        .actor(tecnico)
	                        .tipoAccion(tipoSolucion)
	                        .descripcion(
	                                "La incidencia fue solucionada por el técnico."
	                        )
	                        .estadoAnterior(estadoAnterior)
	                        .estadoNuevo(estadoSolucionada)
	                        .creadoEn(ahora)
	                        .build()
	        );

	        // 12. Actualizar la incidencia
	        incidencia.setEstado(estadoSolucionada);
	        incidencia.setFechaSolucion(ahora);
	        incidencia.setActualizadoEn(ahora);

	        return repositorio.save(incidencia);

	    } catch (Exception e) {

	        // Limpiar archivos físicos si ocurre un error
	        for (String ruta : rutasGuardadas) {
	            try {
	                evidenciaArchivoService.eliminar(ruta);
	            } catch (IOException errorLimpieza) {
	                e.addSuppressed(errorLimpieza);
	            }
	        }

	        if (e instanceof ResponseStatusException errorHttp) {
	            throw errorHttp;
	        }

	        if (e instanceof IllegalArgumentException errorValidacion) {
	            throw new ResponseStatusException(
	                    HttpStatus.BAD_REQUEST,
	                    errorValidacion.getMessage(),
	                    errorValidacion
	            );
	        }

	        throw new ResponseStatusException(
	                HttpStatus.INTERNAL_SERVER_ERROR,
	                "No se pudo finalizar la atención con sus evidencias.",
	                e
	        );
	    }
	}
	
	
	@Override
	@Transactional(rollbackFor = Exception.class)
	public IncidenciaEntity confirmarSolucion(Long id) {

	    // 1. Obtener el usuario autenticado
	    Authentication authentication =
	            SecurityContextHolder.getContext().getAuthentication();

	    if (authentication == null
	            || !authentication.isAuthenticated()
	            || !(authentication.getPrincipal()
	                    instanceof UsuarioPerfilEntity residente)) {

	        throw new ResponseStatusException(
	                HttpStatus.UNAUTHORIZED,
	                "Debes iniciar sesión."
	        );
	    }

	    // 2. Validar rol del usuario
	    if (residente.getRol() == null
	            || !"RESIDENTE".equals(residente.getRol().getCodigo())) {

	        throw new ResponseStatusException(
	                HttpStatus.FORBIDDEN,
	                "Solo un residente puede confirmar la solución."
	        );
	    }

	    // 3. Buscar incidencia
	    IncidenciaEntity incidencia = repositorio.findById(id)
	            .orElseThrow(() -> new ResponseStatusException(
	                    HttpStatus.NOT_FOUND,
	                    "Incidencia no encontrada."
	            ));

	    // 4. Verificar que el residente sea el solicitante
	    if (incidencia.getSolicitante() == null
	            || !incidencia.getSolicitante().getId()
	                    .equals(residente.getId())) {

	        throw new ResponseStatusException(
	                HttpStatus.FORBIDDEN,
	                "No puedes confirmar una incidencia que no has reportado."
	        );
	    }

	    // 5. Validar estado actual
	    if (incidencia.getEstado() == null
	            || !"SOLUCIONADA".equals(
	                    incidencia.getEstado().getCodigo())) {

	        throw new ResponseStatusException(
	                HttpStatus.CONFLICT,
	                "Solo puedes confirmar incidencias en estado SOLUCIONADA."
	        );
	    }

	    // 6. Obtener estado CERRADA
	    EstadoIncidenciaEntity estadoCerrada =
	            estadoRepositorio.findByCodigo("CERRADA")
	                    .orElseThrow(() -> new ResponseStatusException(
	                            HttpStatus.INTERNAL_SERVER_ERROR,
	                            "No existe el estado CERRADA en el catálogo."
	                    ));

	    // 7. Obtener tipo de acción CONFIRMACION
	    TipoAccionIncidenciaEntity tipoConfirmacion =
	            tipoAccionRepositorio.findByCodigo("CONFIRMACION")
	                    .orElseThrow(() -> new ResponseStatusException(
	                            HttpStatus.INTERNAL_SERVER_ERROR,
	                            "No existe el tipo de acción CONFIRMACION."
	                    ));

	    // 8. Registrar fecha y hora de conformidad
	    LocalDateTime ahora = LocalDateTime.now();

	    EstadoIncidenciaEntity estadoAnterior = incidencia.getEstado();

	    ActuacionIncidenciaEntity actuacion =
	            ActuacionIncidenciaEntity.builder()
	                    .incidencia(incidencia)
	                    .actor(residente)
	                    .tipoAccion(tipoConfirmacion)
	                    .descripcion(
	                            "El residente confirmó que la solución fue satisfactoria."
	                    )
	                    .estadoAnterior(estadoAnterior)
	                    .estadoNuevo(estadoCerrada)
	                    .creadoEn(ahora)
	                    .build();

	    actuacionRepositorio.save(actuacion);

	    // 9. Actualizar incidencia
	    incidencia.setEstado(estadoCerrada);
	    incidencia.setFechaCierre(ahora);
	    incidencia.setActualizadoEn(ahora);

	    return repositorio.save(incidencia);
	}
	
	@Override
	@Transactional(rollbackFor = Exception.class)
	public IncidenciaEntity reabrir(Long id, String motivo) {

	    // 1. Obtener usuario autenticado.
	    Authentication authentication =
	        SecurityContextHolder.getContext().getAuthentication();

	    if (authentication == null
	            || !authentication.isAuthenticated()
	            || !(authentication.getPrincipal()
	                instanceof UsuarioPerfilEntity residente)) {

	        throw new ResponseStatusException(
	            HttpStatus.UNAUTHORIZED,
	            "Debes iniciar sesión."
	        );
	    }

	    // 2. Validar rol.
	    if (residente.getRol() == null
	            || !"RESIDENTE".equals(residente.getRol().getCodigo())) {

	        throw new ResponseStatusException(
	            HttpStatus.FORBIDDEN,
	            "Solo un residente puede reabrir una incidencia."
	        );
	    }

	    // 3. Validar motivo.
	    if (motivo == null || motivo.isBlank()) {
	        throw new ResponseStatusException(
	            HttpStatus.BAD_REQUEST,
	            "Debes indicar el motivo de la reapertura."
	        );
	    }

	    // 4. Buscar incidencia.
	    IncidenciaEntity incidencia = repositorio.findById(id)
	        .orElseThrow(() -> new ResponseStatusException(
	            HttpStatus.NOT_FOUND,
	            "Incidencia no encontrada."
	        ));

	    // 5. Validar que pertenezca al residente.
	    if (incidencia.getSolicitante() == null
	            || !incidencia.getSolicitante().getId()
	                .equals(residente.getId())) {

	        throw new ResponseStatusException(
	            HttpStatus.FORBIDDEN,
	            "No puedes reabrir una incidencia que no has reportado."
	        );
	    }

	    // 6. Validar estado actual.
	    if (incidencia.getEstado() == null
	            || !"SOLUCIONADA".equals(
	                incidencia.getEstado().getCodigo())) {

	        throw new ResponseStatusException(
	            HttpStatus.CONFLICT,
	            "Solo puedes reabrir incidencias en estado SOLUCIONADA."
	        );
	    }

	    // 7. Obtener estado REABIERTA.
	    EstadoIncidenciaEntity estadoReabierta =
	        estadoRepositorio.findByCodigo("REABIERTA")
	            .orElseThrow(() -> new ResponseStatusException(
	                HttpStatus.INTERNAL_SERVER_ERROR,
	                "No existe el estado REABIERTA en el catálogo."
	            ));

	    // 8. Obtener tipo de acción REAPERTURA.
	    TipoAccionIncidenciaEntity tipoReapertura =
	        tipoAccionRepositorio.findByCodigo("REAPERTURA")
	            .orElseThrow(() -> new ResponseStatusException(
	                HttpStatus.INTERNAL_SERVER_ERROR,
	                "No existe el tipo de acción REAPERTURA."
	            ));

	    LocalDateTime ahora = LocalDateTime.now();

	    EstadoIncidenciaEntity estadoAnterior = incidencia.getEstado();

	    // 9. Registrar reapertura en el historial.
	    ActuacionIncidenciaEntity actuacion =
	        ActuacionIncidenciaEntity.builder()
	            .incidencia(incidencia)
	            .actor(residente)
	            .tipoAccion(tipoReapertura)
	            .descripcion("El residente indicó que el problema continúa. Motivo: "
	                + motivo.trim())
	            .estadoAnterior(estadoAnterior)
	            .estadoNuevo(estadoReabierta)
	            .creadoEn(ahora)
	            .build();

	    actuacionRepositorio.save(actuacion);

	    // 10. Actualizar incidencia.
	    incidencia.setEstado(estadoReabierta);
	    incidencia.setActualizadoEn(ahora);

	    return repositorio.save(incidencia);
	}


}