package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.RolEntity;
import pe.com.promantenimineto.repository.RolRepository;
import pe.com.promantenimineto.service.RolService;

@Service
public class RolServiceImpl implements RolService{

    @Autowired
    private RolRepository repositorio;

    @Override
    public List<RolEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<RolEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public RolEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public RolEntity add(RolEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public RolEntity update(RolEntity obj, Long id) {
        RolEntity objRol = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objRol);
        return repositorio.save(objRol);
    }

    @Override
    public RolEntity delete(Long id) {
        RolEntity objRol = repositorio.findById(id).get();
        objRol.setActivo(false);
        return repositorio.save(objRol);
    }

    @Override
    public RolEntity enable(Long id) {
        RolEntity objRol = repositorio.findById(id).get();
        objRol.setActivo(true);
        return repositorio.save(objRol);
    }
}