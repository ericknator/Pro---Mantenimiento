package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.repository.UsuarioPerfilRepository;
import pe.com.promantenimineto.service.UsuarioPerfilService;

@Service
public class UsuarioPerfilServiceImpl implements UsuarioPerfilService{

    @Autowired
    private UsuarioPerfilRepository repositorio;

    @Override
    public List<UsuarioPerfilEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<UsuarioPerfilEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public UsuarioPerfilEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public UsuarioPerfilEntity add(UsuarioPerfilEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public UsuarioPerfilEntity update(UsuarioPerfilEntity obj, Long id) {
        UsuarioPerfilEntity objUsuarioPerfil = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objUsuarioPerfil);
        return repositorio.save(objUsuarioPerfil);
    }

    @Override
    public UsuarioPerfilEntity delete(Long id) {
        UsuarioPerfilEntity objUsuarioPerfil = repositorio.findById(id).get();
        objUsuarioPerfil.setActivo(false);
        return repositorio.save(objUsuarioPerfil);
    }

    @Override
    public UsuarioPerfilEntity enable(Long id) {
        UsuarioPerfilEntity objUsuarioPerfil = repositorio.findById(id).get();
        objUsuarioPerfil.setActivo(true);
        return repositorio.save(objUsuarioPerfil);
    }
}