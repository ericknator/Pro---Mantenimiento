package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.UsuarioUnidadEntity;
import pe.com.promantenimineto.repository.UsuarioUnidadRepository;
import pe.com.promantenimineto.service.UsuarioUnidadService;

@Service
public class UsuarioUnidadServiceImpl implements UsuarioUnidadService{

    @Autowired
    private UsuarioUnidadRepository repositorio;

    @Override
    public List<UsuarioUnidadEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<UsuarioUnidadEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public UsuarioUnidadEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public UsuarioUnidadEntity add(UsuarioUnidadEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public UsuarioUnidadEntity update(UsuarioUnidadEntity obj, Long id) {
        UsuarioUnidadEntity objUsuarioUnidad = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objUsuarioUnidad);
        return repositorio.save(objUsuarioUnidad);
    }

    @Override
    public UsuarioUnidadEntity delete(Long id) {
        UsuarioUnidadEntity objUsuarioUnidad = repositorio.findById(id).get();
        objUsuarioUnidad.setActivo(false);
        return repositorio.save(objUsuarioUnidad);
    }

    @Override
    public UsuarioUnidadEntity enable(Long id) {
        UsuarioUnidadEntity objUsuarioUnidad = repositorio.findById(id).get();
        objUsuarioUnidad.setActivo(true);
        return repositorio.save(objUsuarioUnidad);
    }
}