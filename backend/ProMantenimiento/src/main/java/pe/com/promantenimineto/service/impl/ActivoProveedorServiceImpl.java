package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.ActivoProveedorEntity;
import pe.com.promantenimineto.repository.ActivoProveedorRepository;
import pe.com.promantenimineto.service.ActivoProveedorService;

@Service
public class ActivoProveedorServiceImpl implements ActivoProveedorService{

    @Autowired
    private ActivoProveedorRepository repositorio;

    @Override
    public List<ActivoProveedorEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<ActivoProveedorEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public ActivoProveedorEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public ActivoProveedorEntity add(ActivoProveedorEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public ActivoProveedorEntity update(ActivoProveedorEntity obj, Long id) {
        ActivoProveedorEntity objActivoProveedor = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objActivoProveedor);
        return repositorio.save(objActivoProveedor);
    }

    @Override
    public ActivoProveedorEntity delete(Long id) {
        ActivoProveedorEntity objActivoProveedor = repositorio.findById(id).get();
        objActivoProveedor.setActivo(false);
        return repositorio.save(objActivoProveedor);
    }

    @Override
    public ActivoProveedorEntity enable(Long id) {
        ActivoProveedorEntity objActivoProveedor = repositorio.findById(id).get();
        objActivoProveedor.setActivo(true);
        return repositorio.save(objActivoProveedor);
    }
}
