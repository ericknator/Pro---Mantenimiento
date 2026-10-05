package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.RolPermisoEntity;
import pe.com.promantenimineto.repository.RolPermisoRepository;
import pe.com.promantenimineto.service.RolPermisoService;

@Service
public class RolPermisoServiceImpl implements RolPermisoService{

    @Autowired
    private RolPermisoRepository repositorio;

    @Override
    public List<RolPermisoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<RolPermisoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public RolPermisoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public RolPermisoEntity add(RolPermisoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public RolPermisoEntity update(RolPermisoEntity obj, Long id) {
        RolPermisoEntity objRolPermiso = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objRolPermiso);
        return repositorio.save(objRolPermiso);
    }

    @Override
    public RolPermisoEntity delete(Long id) {
        return null;
    }

    @Override
    public RolPermisoEntity enable(Long id) {
        return null;
    }
}