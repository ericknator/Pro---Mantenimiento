package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.FrecuenciaMantenimientoEntity;
import pe.com.promantenimineto.repository.FrecuenciaMantenimientoRepository;
import pe.com.promantenimineto.service.FrecuenciaMantenimientoService;

@Service
public class FrecuenciaMantenimientoServiceImpl implements FrecuenciaMantenimientoService{

    @Autowired
    private FrecuenciaMantenimientoRepository repositorio;

    @Override
    public List<FrecuenciaMantenimientoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<FrecuenciaMantenimientoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public FrecuenciaMantenimientoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public FrecuenciaMantenimientoEntity add(FrecuenciaMantenimientoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public FrecuenciaMantenimientoEntity update(FrecuenciaMantenimientoEntity obj, Long id) {
        FrecuenciaMantenimientoEntity objFrecuenciaMantenimiento = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objFrecuenciaMantenimiento);
        return repositorio.save(objFrecuenciaMantenimiento);
    }

    @Override
    public FrecuenciaMantenimientoEntity delete(Long id) {
        FrecuenciaMantenimientoEntity objFrecuenciaMantenimiento = repositorio.findById(id).get();
        objFrecuenciaMantenimiento.setActivo(false);
        return repositorio.save(objFrecuenciaMantenimiento);
    }

    @Override
    public FrecuenciaMantenimientoEntity enable(Long id) {
        FrecuenciaMantenimientoEntity objFrecuenciaMantenimiento = repositorio.findById(id).get();
        objFrecuenciaMantenimiento.setActivo(true);
        return repositorio.save(objFrecuenciaMantenimiento);
    }
}