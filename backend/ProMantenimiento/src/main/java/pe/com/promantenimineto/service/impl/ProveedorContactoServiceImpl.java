package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.ProveedorContactoEntity;
import pe.com.promantenimineto.repository.ProveedorContactoRepository;
import pe.com.promantenimineto.service.ProveedorContactoService;

@Service
public class ProveedorContactoServiceImpl implements ProveedorContactoService{

    @Autowired
    private ProveedorContactoRepository repositorio;

    @Override
    public List<ProveedorContactoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<ProveedorContactoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public ProveedorContactoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public ProveedorContactoEntity add(ProveedorContactoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public ProveedorContactoEntity update(ProveedorContactoEntity obj, Long id) {
        ProveedorContactoEntity objProveedorContacto = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objProveedorContacto);
        return repositorio.save(objProveedorContacto);
    }

    @Override
    public ProveedorContactoEntity delete(Long id) {
        ProveedorContactoEntity objProveedorContacto = repositorio.findById(id).get();
        objProveedorContacto.setActivo(false);
        return repositorio.save(objProveedorContacto);
    }

    @Override
    public ProveedorContactoEntity enable(Long id) {
        ProveedorContactoEntity objProveedorContacto = repositorio.findById(id).get();
        objProveedorContacto.setActivo(true);
        return repositorio.save(objProveedorContacto);
    }
}