package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.CuotaUnidadEntity;
import pe.com.promantenimineto.repository.CuotaUnidadRepository;
import pe.com.promantenimineto.service.CuotaUnidadService;

@Service
public class CuotaUnidadServiceImpl implements CuotaUnidadService{

    @Autowired
    private CuotaUnidadRepository repositorio;

    @Override
    public List<CuotaUnidadEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<CuotaUnidadEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public CuotaUnidadEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public CuotaUnidadEntity add(CuotaUnidadEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public CuotaUnidadEntity update(CuotaUnidadEntity obj, Long id) {
        CuotaUnidadEntity objCuotaUnidad = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objCuotaUnidad);
        return repositorio.save(objCuotaUnidad);
    }

    @Override
    public CuotaUnidadEntity delete(Long id) {
        return null;
    }

    @Override
    public CuotaUnidadEntity enable(Long id) {
        return null;
    }
}