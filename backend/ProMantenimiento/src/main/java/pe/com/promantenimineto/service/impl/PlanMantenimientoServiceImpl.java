package pe.com.promantenimineto.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;


import pe.com.promantenimineto.entity.PlanMantenimientoEntity;
import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.repository.ActivoRepository;
import pe.com.promantenimineto.repository.EstadoPlanMantenimientoRepository;
import pe.com.promantenimineto.repository.EstadoTareaPreventivaRepository;
import pe.com.promantenimineto.repository.FrecuenciaMantenimientoRepository;
import pe.com.promantenimineto.repository.PlanMantenimientoRepository;
import pe.com.promantenimineto.repository.TareaPreventivaRepository;
import pe.com.promantenimineto.repository.UsuarioPerfilRepository;
import pe.com.promantenimineto.service.PlanMantenimientoService;

@Service
public class PlanMantenimientoServiceImpl implements PlanMantenimientoService{

    @Autowired
    private PlanMantenimientoRepository repositorio;

    @Autowired
    private ActivoRepository activoRepository;

    @Autowired
    private FrecuenciaMantenimientoRepository frecuenciaRepository;

    @Autowired
    private EstadoPlanMantenimientoRepository estadoPlanRepository;

    @Autowired
    private EstadoTareaPreventivaRepository estadoTareaRepository;

    @Autowired
    private TareaPreventivaRepository tareaRepository;

    @Autowired
    private UsuarioPerfilRepository usuarioRepository;

    @Override
    public List<PlanMantenimientoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<PlanMantenimientoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public PlanMantenimientoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    @Transactional
    public PlanMantenimientoEntity add(PlanMantenimientoEntity obj) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null ||  !(auth.getPrincipal() instanceof UsuarioPerfilEntity)) {
            throw new AccessDeniedException(  "No se pudo identificar al usuario autenticado.");
        }

        if (auth.getAuthorities().stream().noneMatch( autoridad -> autoridad.getAuthority().equals("ROLE_ADMINISTRADOR"))) {
            throw new AccessDeniedException(
                    "Solo un administrador puede programar mantenimientos.");
        }

        UsuarioPerfilEntity creador = (UsuarioPerfilEntity) auth.getPrincipal();

        // Validar datos obligatorios
        if (obj.getActivo() == null || obj.getActivo().getId() == null) {
            throw new IllegalArgumentException( "Debe seleccionar un activo.");
        }

        if (obj.getFrecuencia() == null || obj.getFrecuencia().getId() == null) {
            throw new IllegalArgumentException( "Debe seleccionar una frecuencia.");
        }

        if (obj.getResponsable() == null || obj.getResponsable().getId() == null) {
            throw new IllegalArgumentException( "Debe seleccionar un responsable.");
        }

        if (obj.getPrimeraTareaProgramadaPara() == null) {
            throw new IllegalArgumentException( "Debe indicar la fecha y hora de la primera tarea.");
        }

        if (obj.getTitulo() == null || obj.getTitulo().isBlank()) {
            throw new IllegalArgumentException( "Debe ingresar el título del mantenimiento.");
        }

        // Obtener el activo existente
        var activo = activoRepository.findById( obj.getActivo().getId()).orElseThrow(() ->
                new IllegalArgumentException("El activo no existe."));

        if (!Boolean.TRUE.equals(activo.getActivo())) {
            throw new IllegalArgumentException( "El activo seleccionado está inactivo.");
        }

        // Obtener la frecuencia existente
        var frecuencia = frecuenciaRepository.findById( obj.getFrecuencia().getId() ).orElseThrow(() ->
                new IllegalArgumentException("La frecuencia no existe."));

        if (!Boolean.TRUE.equals(frecuencia.getActivo())) {
            throw new IllegalArgumentException( "La frecuencia seleccionada está inactiva.");
        }

        // Obtener y validar al responsable
        UsuarioPerfilEntity responsable = usuarioRepository.findById( obj.getResponsable().getId()  ).orElseThrow(() ->
                new IllegalArgumentException("El responsable no existe."));

        if (!Boolean.TRUE.equals(responsable.getActivo()) ||
                responsable.getRol() == null ||
                !Boolean.TRUE.equals(responsable.getRol().getActivo()) ||
                !"MANTENIMIENTO".equals( responsable.getRol().getCodigo())) {
            throw new IllegalArgumentException(
                    "El responsable debe tener un perfil activo con el rol MANTENIMIENTO.");
        }

        // Obtener el estado ACTIVO del plan
        var estadoPlan = estadoPlanRepository.findById(1L)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No existe el estado ACTIVO del plan."));

        // Obtener el estado PROGRAMADA de la tarea
        var estadoTarea = estadoTareaRepository.findById(1L)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No existe el estado PROGRAMADA de la tarea."));

        LocalDateTime programadaPara = obj.getPrimeraTareaProgramadaPara();

        LocalDateTime ahora = LocalDateTime.now();

        // Preparar el plan
        obj.setActivo(activo);
        obj.setFrecuencia(frecuencia);
        obj.setEstadoPlan(estadoPlan);
        obj.setResponsable(responsable);
        obj.setCreadoPor(creador);
        obj.setFechaInicio(programadaPara.toLocalDate());
        obj.setProximaFecha(programadaPara.toLocalDate());

        if (obj.getDiasAlerta() == null) {
            obj.setDiasAlerta(3);
        }

        obj.setCreadoEn(ahora);
        obj.setActualizadoEn(ahora);

        // Guardar el plan primero
        PlanMantenimientoEntity planGuardado = repositorio.save(obj);

        // Crear la primera tarea preventiva
        var tarea = pe.com.promantenimineto.entity.TareaPreventivaEntity
                .builder()
                .planMantenimiento(planGuardado)
                .activo(activo)
                .responsable(responsable)
                .creadoPor(creador)
                .estado(estadoTarea)
                .titulo(planGuardado.getTitulo())
                .descripcion(planGuardado.getDescripcion())
                .programadaPara(programadaPara)
                .fechaInicio(null)
                .fechaFin(null)
                .creadoEn(ahora)
                .actualizadoEn(ahora)
                .build();

        // Guardar la tarea
        tareaRepository.save(tarea);

        return planGuardado;
    }

    @Override
    public PlanMantenimientoEntity update(PlanMantenimientoEntity obj, Long id) {
        PlanMantenimientoEntity objPlanMantenimiento = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objPlanMantenimiento);
        return repositorio.save(objPlanMantenimiento);
    }

    @Override
    public PlanMantenimientoEntity delete(Long id) {
        return null;
    }

    @Override
    public PlanMantenimientoEntity enable(Long id) {
        return null;
    }
}