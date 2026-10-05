package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.EstadoPlanMantenimientoEntity;
import pe.com.promantenimineto.repository.EstadoPlanMantenimientoRepository;
import pe.com.promantenimineto.service.EstadoPlanMantenimientoService;

@Service
public class EstadoPlanMantenimientoServiceImpl implements EstadoPlanMantenimientoService{

    @Autowired
    private EstadoPlanMantenimientoRepository repositorio;

    @Override
    public List<EstadoPlanMantenimientoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<EstadoPlanMantenimientoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public EstadoPlanMantenimientoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public EstadoPlanMantenimientoEntity add(EstadoPlanMantenimientoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public EstadoPlanMantenimientoEntity update(EstadoPlanMantenimientoEntity obj, Long id) {
        EstadoPlanMantenimientoEntity objEstadoPlanMantenimiento = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objEstadoPlanMantenimiento);
        return repositorio.save(objEstadoPlanMantenimiento);
    }

    @Override
    public EstadoPlanMantenimientoEntity delete(Long id) {
        EstadoPlanMantenimientoEntity objEstadoPlanMantenimiento = repositorio.findById(id).get();
        objEstadoPlanMantenimiento.setActivo(false);
        return repositorio.save(objEstadoPlanMantenimiento);
    }

    @Override
    public EstadoPlanMantenimientoEntity enable(Long id) {
        EstadoPlanMantenimientoEntity objEstadoPlanMantenimiento = repositorio.findById(id).get();
        objEstadoPlanMantenimiento.setActivo(true);
        return repositorio.save(objEstadoPlanMantenimiento);
    }
}