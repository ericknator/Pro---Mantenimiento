package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.PermisoEntity;
import pe.com.promantenimineto.repository.PermisoRepository;
import pe.com.promantenimineto.service.PermisoService;

@Service
public class PermisoServiceImpl implements PermisoService{

    @Autowired
    private PermisoRepository repositorio;

    @Override
    public List<PermisoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<PermisoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public PermisoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public PermisoEntity add(PermisoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public PermisoEntity update(PermisoEntity obj, Long id) {
        PermisoEntity objPermiso = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objPermiso);
        return repositorio.save(objPermiso);
    }

    @Override
    public PermisoEntity delete(Long id) {
        PermisoEntity objPermiso = repositorio.findById(id).get();
        objPermiso.setActivo(false);
        return repositorio.save(objPermiso);
    }

    @Override
    public PermisoEntity enable(Long id) {
        PermisoEntity objPermiso = repositorio.findById(id).get();
        objPermiso.setActivo(true);
        return repositorio.save(objPermiso);
    }
}