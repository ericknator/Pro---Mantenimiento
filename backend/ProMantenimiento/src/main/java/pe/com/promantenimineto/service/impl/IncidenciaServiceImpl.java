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

        // Todos los roles consultan únicamente sus propias incidencias.
        if ("ADMINISTRADOR".equals(rol) || "RESIDENTE".equals(rol) || "MANTENIMIENTO".equals(rol) || "PORTERIA_SEGURIDAD".equals(rol)) {
            return repositorio.findBySolicitanteId(usuario.getId());
        }
        
        // El personal de mantenimiento o seguridad consulta las incidencias asignadas a él.
        if ("MANTENIMIENTO".equals(rol) || "PORTERIA_SEGURIDAD".equals(rol)) {
            return repositorio.findByResponsableActualId(usuario.getId());
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
    
}