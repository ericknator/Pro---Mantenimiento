package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.IncidenciaEntity;
import pe.com.promantenimineto.repository.IncidenciaRepository;
import pe.com.promantenimineto.service.IncidenciaService;

@Service
public class IncidenciaServiceImpl implements IncidenciaService{

    @Autowired
    private IncidenciaRepository repositorio;

    @Override
    public List<IncidenciaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<IncidenciaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public IncidenciaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public IncidenciaEntity add(IncidenciaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public IncidenciaEntity update(IncidenciaEntity obj, Long id) {
        IncidenciaEntity objIncidencia = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objIncidencia);
        return repositorio.save(objIncidencia);
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