package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.EstadoIncidenciaEntity;
import pe.com.promantenimineto.repository.EstadoIncidenciaRepository;
import pe.com.promantenimineto.service.EstadoIncidenciaService;

@Service
public class EstadoIncidenciaServiceImpl implements EstadoIncidenciaService{

    @Autowired
    private EstadoIncidenciaRepository repositorio;

    @Override
    public List<EstadoIncidenciaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<EstadoIncidenciaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public EstadoIncidenciaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public EstadoIncidenciaEntity add(EstadoIncidenciaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public EstadoIncidenciaEntity update(EstadoIncidenciaEntity obj, Long id) {
        EstadoIncidenciaEntity objEstadoIncidencia = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objEstadoIncidencia);
        return repositorio.save(objEstadoIncidencia);
    }

    @Override
    public EstadoIncidenciaEntity delete(Long id) {
        EstadoIncidenciaEntity objEstadoIncidencia = repositorio.findById(id).get();
        objEstadoIncidencia.setActivo(false);
        return repositorio.save(objEstadoIncidencia);
    }

    @Override
    public EstadoIncidenciaEntity enable(Long id) {
        EstadoIncidenciaEntity objEstadoIncidencia = repositorio.findById(id).get();
        objEstadoIncidencia.setActivo(true);
        return repositorio.save(objEstadoIncidencia);
    }
}