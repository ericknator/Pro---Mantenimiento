package pe.com.promantenimineto.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import pe.com.promantenimineto.entity.EstadoTareaPreventivaEntity;
import pe.com.promantenimineto.entity.TareaPreventivaEntity;
import pe.com.promantenimineto.repository.EstadoTareaPreventivaRepository;
import pe.com.promantenimineto.repository.TareaPreventivaRepository;
import pe.com.promantenimineto.service.TareaPreventivaService;
import pe.com.promantenimineto.entity.EvidenciaMantenimientoEntity;
import pe.com.promantenimineto.entity.IntervencionPreventivaEntity;
import pe.com.promantenimineto.entity.TipoEvidenciaEntity;
import pe.com.promantenimineto.repository.EvidenciaMantenimientoRepository;
import pe.com.promantenimineto.repository.IntervencionPreventivaRepository;
import pe.com.promantenimineto.repository.TipoEvidenciaRepository;
import pe.com.promantenimineto.service.EvidenciaArchivoService;

@Service
public class TareaPreventivaServiceImpl implements TareaPreventivaService{

    @Autowired
    private TareaPreventivaRepository repositorio;
    
    @Autowired
    private EstadoTareaPreventivaRepository estadoRepositorio;
    
    @Autowired
    private IntervencionPreventivaRepository intervencionRepositorio;

    @Autowired
    private EvidenciaMantenimientoRepository evidenciaRepositorio;

    @Autowired
    private TipoEvidenciaRepository tipoEvidenciaRepositorio;

    @Autowired
    private EvidenciaArchivoService evidenciaArchivoService;
    
    

    @Override
    public List<TareaPreventivaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<TareaPreventivaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public TareaPreventivaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public TareaPreventivaEntity add(TareaPreventivaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public TareaPreventivaEntity update(TareaPreventivaEntity obj, Long id) {
        TareaPreventivaEntity objTareaPreventiva = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objTareaPreventiva);
        return repositorio.save(objTareaPreventiva);
    }

    @Override
    public TareaPreventivaEntity delete(Long id) {
        return null;
    }

    @Override
    public TareaPreventivaEntity enable(Long id) {
        return null;
    }
    
    @Override
    public List<TareaPreventivaEntity> findByResponsableId(Long responsableId){
    	return repositorio.findByResponsableId(responsableId);
    }
    
    @Override
    @Transactional
    public TareaPreventivaEntity iniciarAtencion(Long id, Long responsableId) {

        // 1. Buscar la tarea
        TareaPreventivaEntity tarea = repositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "No se encontró la tarea preventiva."
                ));

        // 2. Validar que la tarea esté asignada al usuario autenticado
        if (tarea.getResponsable() == null
                || !responsableId.equals(tarea.getResponsable().getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No tienes permiso para iniciar esta tarea."
            );
        }

        // 3. Validar que el estado actual sea PROGRAMADA
        if (tarea.getEstado() == null || !"PROGRAMADA".equals(tarea.getEstado().getCodigo())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden iniciar tareas que estén en estado PROGRAMADA."
            );
        }

        // 4. Buscar el estado EN_EJECUCION
        EstadoTareaPreventivaEntity estadoEnEjecucion =
                estadoRepositorio.findByCodigoAndActivoTrue("EN_EJECUCION")
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "No se encontró el estado EN_EJECUCION activo."
                        ));

        // 5. Actualizar la tarea
        LocalDateTime ahora = LocalDateTime.now();

        tarea.setEstado(estadoEnEjecucion);
        tarea.setFechaInicio(ahora);
        tarea.setActualizadoEn(ahora);

        // 6. Guardar los cambios
        return repositorio.save(tarea);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public IntervencionPreventivaEntity registrarIntervencion(
            Long id,
            Long ejecutorId,
            LocalDateTime fechaEjecucion,
            String observaciones,
            String accionesRealizadas,
            List<MultipartFile> archivos) {

        List<String> rutasGuardadas = new ArrayList<>();

        try {

            // 1. Buscar la tarea preventiva
            TareaPreventivaEntity tarea = repositorio.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "No se encontró la tarea preventiva."
                    ));

            // 2. Validar que la tarea esté asignada al ejecutor
            if (tarea.getResponsable() == null || !ejecutorId.equals(tarea.getResponsable().getId())) {
                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "La tarea no está asignada a tu usuario."
                );
            }

            // 3. Validar estado actual
            if (tarea.getEstado() == null || !"EN_EJECUCION".equals(tarea.getEstado().getCodigo())) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "La tarea debe estar en estado EN_EJECUCION."
                );
            }

            // 4. Validar fecha de ejecución
            if (fechaEjecucion == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La fecha de ejecución es obligatoria."
                );
            }

            // 5. Validar acciones realizadas
            if (accionesRealizadas == null || accionesRealizadas.isBlank()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "El trabajo efectuado es obligatorio."
                );
            }

            // 6. Validar cantidad de evidencias
            if (archivos != null && archivos.size() > 3) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Solo puedes adjuntar un máximo de 3 evidencias."
                );
            }

            // 7. Validar archivos vacíos
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

            // 8. Buscar el estado EJECUTADA
            EstadoTareaPreventivaEntity estadoEjecutada =
                    estadoRepositorio.findByCodigoAndActivoTrue("EJECUTADA")
                            .orElseThrow(() -> new ResponseStatusException(
                                    HttpStatus.INTERNAL_SERVER_ERROR,
                                    "No se encontró el estado EJECUTADA activo."
                            ));

            // 9. Registrar la intervención
            LocalDateTime ahora = LocalDateTime.now();

            IntervencionPreventivaEntity intervencion =
                    IntervencionPreventivaEntity.builder()
                            .tareaPreventiva(tarea)
                            .ejecutorUsuario(tarea.getResponsable())
                            .proveedor(tarea.getProveedor())
                            .accionesRealizadas(accionesRealizadas.trim())
                            .observaciones(
                                    observaciones != null && !observaciones.isBlank()
                                            ? observaciones.trim()
                                            : null
                            )
                            .ejecutadoEn(fechaEjecucion)
                            .creadoEn(ahora)
                            .build();

            intervencion = intervencionRepositorio.save(intervencion);

            // 10. Guardar evidencias
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

                    // Buscar tipo de evidencia
                    TipoEvidenciaEntity tipo =
                            tipoEvidenciaRepositorio
                                    .findByCodigoAndActivoTrue(codigoTipo)
                                    .orElseThrow(() -> new ResponseStatusException(
                                            HttpStatus.INTERNAL_SERVER_ERROR,
                                            "No existe un tipo de evidencia activo: "
                                                    + codigoTipo
                                    ));

                    // Guardar archivo físico
                    String ruta = evidenciaArchivoService.guardar(
                            archivo,
                            "TAREA-PREVENTIVA-" + id
                    );

                    rutasGuardadas.add(ruta);

                    // Registrar metadatos
                    EvidenciaMantenimientoEntity evidencia =
                            EvidenciaMantenimientoEntity.builder()
                                    .intervencionPreventiva(intervencion)
                                    .autor(tarea.getResponsable())
                                    .tipoEvidencia(tipo)
                                    .nombreArchivo(
                                            Path.of(ruta).getFileName().toString()
                                    )
                                    .urlRecurso(ruta)
                                    .descripcion(
                                            "Evidencia de intervención preventiva"
                                    )
                                    .build();

                    evidenciaRepositorio.save(evidencia);
                }
            }

            // 11. Actualizar estado y fechas de la tarea
            tarea.setEstado(estadoEjecutada);
            tarea.setFechaFin(ahora);
            tarea.setActualizadoEn(ahora);

            repositorio.save(tarea);

            // 12. Retornar intervención registrada
            return intervencion;

        } catch (Exception e) {

            // Eliminar archivos físicos si ocurre un error
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
                    "No se pudo registrar la intervención preventiva.",
                    e
            );
        }
    }
    
    
}