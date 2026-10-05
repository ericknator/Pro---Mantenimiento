package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.EstadoActivoEntity;
import pe.com.promantenimineto.repository.EstadoActivoRepository;
import pe.com.promantenimineto.service.EstadoActivoService;

@Service
public class EstadoActivoServiceImpl implements EstadoActivoService{

    @Autowired
    private EstadoActivoRepository repositorio;

    @Override
    public List<EstadoActivoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<EstadoActivoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public EstadoActivoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public EstadoActivoEntity add(EstadoActivoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public EstadoActivoEntity update(EstadoActivoEntity obj, Long id) {
        EstadoActivoEntity objEstadoActivo = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objEstadoActivo);
        return repositorio.save(objEstadoActivo);
    }

    @Override
    public EstadoActivoEntity delete(Long id) {
        EstadoActivoEntity objEstadoActivo = repositorio.findById(id).get();
        objEstadoActivo.setActivo(false);
        return repositorio.save(objEstadoActivo);
    }

    @Override
    public EstadoActivoEntity enable(Long id) {
        EstadoActivoEntity objEstadoActivo = repositorio.findById(id).get();
        objEstadoActivo.setActivo(true);
        return repositorio.save(objEstadoActivo);
    }
}