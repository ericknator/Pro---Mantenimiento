package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.EstadoTareaPreventivaEntity;
import pe.com.promantenimineto.repository.EstadoTareaPreventivaRepository;
import pe.com.promantenimineto.service.EstadoTareaPreventivaService;

@Service
public class EstadoTareaPreventivaServiceImpl implements EstadoTareaPreventivaService{

    @Autowired
    private EstadoTareaPreventivaRepository repositorio;

    @Override
    public List<EstadoTareaPreventivaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<EstadoTareaPreventivaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public EstadoTareaPreventivaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public EstadoTareaPreventivaEntity add(EstadoTareaPreventivaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public EstadoTareaPreventivaEntity update(EstadoTareaPreventivaEntity obj, Long id) {
        EstadoTareaPreventivaEntity objEstadoTareaPreventiva = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objEstadoTareaPreventiva);
        return repositorio.save(objEstadoTareaPreventiva);
    }

    @Override
    public EstadoTareaPreventivaEntity delete(Long id) {
        EstadoTareaPreventivaEntity objEstadoTareaPreventiva = repositorio.findById(id).get();
        objEstadoTareaPreventiva.setActivo(false);
        return repositorio.save(objEstadoTareaPreventiva);
    }

    @Override
    public EstadoTareaPreventivaEntity enable(Long id) {
        EstadoTareaPreventivaEntity objEstadoTareaPreventiva = repositorio.findById(id).get();
        objEstadoTareaPreventiva.setActivo(true);
        return repositorio.save(objEstadoTareaPreventiva);
    }
}