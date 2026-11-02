package pe.com.promantenimineto.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pe.com.promantenimineto.entity.EstadoTareaPreventivaEntity;
import pe.com.promantenimineto.entity.TareaPreventivaEntity;
import pe.com.promantenimineto.repository.EstadoTareaPreventivaRepository;
import pe.com.promantenimineto.repository.TareaPreventivaRepository;
import pe.com.promantenimineto.service.TareaPreventivaService;

@Service
public class TareaPreventivaServiceImpl implements TareaPreventivaService{

    @Autowired
    private TareaPreventivaRepository repositorio;
    
    @Autowired
    private EstadoTareaPreventivaRepository estadoRepositorio;

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
}