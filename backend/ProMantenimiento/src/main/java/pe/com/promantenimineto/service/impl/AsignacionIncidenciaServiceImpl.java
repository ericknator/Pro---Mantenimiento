package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.AsignacionIncidenciaEntity;
import pe.com.promantenimineto.repository.AsignacionIncidenciaRepository;
import pe.com.promantenimineto.service.AsignacionIncidenciaService;

@Service
public class AsignacionIncidenciaServiceImpl implements AsignacionIncidenciaService{

    @Autowired
    private AsignacionIncidenciaRepository repositorio;

    @Override
    public List<AsignacionIncidenciaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<AsignacionIncidenciaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public AsignacionIncidenciaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public AsignacionIncidenciaEntity add(AsignacionIncidenciaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public AsignacionIncidenciaEntity update(AsignacionIncidenciaEntity obj, Long id) {
        AsignacionIncidenciaEntity objAsignacionIncidencia = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objAsignacionIncidencia);
        return repositorio.save(objAsignacionIncidencia);
    }

    @Override
    public AsignacionIncidenciaEntity delete(Long id) {
        return null;
    }

    @Override
    public AsignacionIncidenciaEntity enable(Long id) {
        return null;
    }
}