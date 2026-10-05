package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.ComentarioIncidenciaEntity;
import pe.com.promantenimineto.repository.ComentarioIncidenciaRepository;
import pe.com.promantenimineto.service.ComentarioIncidenciaService;

@Service
public class ComentarioIncidenciaServiceImpl implements ComentarioIncidenciaService{

    @Autowired
    private ComentarioIncidenciaRepository repositorio;

    @Override
    public List<ComentarioIncidenciaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<ComentarioIncidenciaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public ComentarioIncidenciaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public ComentarioIncidenciaEntity add(ComentarioIncidenciaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public ComentarioIncidenciaEntity update(ComentarioIncidenciaEntity obj, Long id) {
        ComentarioIncidenciaEntity objComentarioIncidencia = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objComentarioIncidencia);
        return repositorio.save(objComentarioIncidencia);
    }

    @Override
    public ComentarioIncidenciaEntity delete(Long id) {
        return null;
    }

    @Override
    public ComentarioIncidenciaEntity enable(Long id) {
        return null;
    }
}