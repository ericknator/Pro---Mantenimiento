package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.ActuacionIncidenciaEntity;
import pe.com.promantenimineto.repository.ActuacionIncidenciaRepository;
import pe.com.promantenimineto.service.ActuacionIncidenciaService;

@Service
public class ActuacionIncidenciaServiceImpl implements ActuacionIncidenciaService{

    @Autowired
    private ActuacionIncidenciaRepository repositorio;

    @Override
    public List<ActuacionIncidenciaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<ActuacionIncidenciaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public ActuacionIncidenciaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public ActuacionIncidenciaEntity add(ActuacionIncidenciaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public ActuacionIncidenciaEntity update(ActuacionIncidenciaEntity obj, Long id) {
        ActuacionIncidenciaEntity objActuacionIncidencia = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objActuacionIncidencia);
        return repositorio.save(objActuacionIncidencia);
    }

    @Override
    public ActuacionIncidenciaEntity delete(Long id) {
        return null;
    }

    @Override
    public ActuacionIncidenciaEntity enable(Long id) {
        return null;
    }
}