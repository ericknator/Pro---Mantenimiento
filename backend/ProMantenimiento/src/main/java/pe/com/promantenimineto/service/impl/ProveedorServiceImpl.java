package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.ProveedorEntity;
import pe.com.promantenimineto.repository.ProveedorRepository;
import pe.com.promantenimineto.service.ProveedorService;

@Service
public class ProveedorServiceImpl implements ProveedorService{

    @Autowired
    private ProveedorRepository repositorio;

    @Override
    public List<ProveedorEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<ProveedorEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public ProveedorEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public ProveedorEntity add(ProveedorEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public ProveedorEntity update(ProveedorEntity obj, Long id) {
        ProveedorEntity objProveedor = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objProveedor);
        return repositorio.save(objProveedor);
    }

    @Override
    public ProveedorEntity delete(Long id) {
        ProveedorEntity objProveedor = repositorio.findById(id).get();
        objProveedor.setActivo(false);
        return repositorio.save(objProveedor);
    }

    @Override
    public ProveedorEntity enable(Long id) {
        ProveedorEntity objProveedor = repositorio.findById(id).get();
        objProveedor.setActivo(true);
        return repositorio.save(objProveedor);
    }
}