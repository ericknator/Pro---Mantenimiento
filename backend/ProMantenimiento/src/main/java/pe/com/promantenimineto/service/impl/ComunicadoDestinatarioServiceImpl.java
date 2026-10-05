package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.ComunicadoDestinatarioEntity;
import pe.com.promantenimineto.repository.ComunicadoDestinatarioRepository;
import pe.com.promantenimineto.service.ComunicadoDestinatarioService;

@Service
public class ComunicadoDestinatarioServiceImpl implements ComunicadoDestinatarioService{

    @Autowired
    private ComunicadoDestinatarioRepository repositorio;

    @Override
    public List<ComunicadoDestinatarioEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<ComunicadoDestinatarioEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public ComunicadoDestinatarioEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public ComunicadoDestinatarioEntity add(ComunicadoDestinatarioEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public ComunicadoDestinatarioEntity update(ComunicadoDestinatarioEntity obj, Long id) {
        ComunicadoDestinatarioEntity objComunicadoDestinatario = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objComunicadoDestinatario);
        return repositorio.save(objComunicadoDestinatario);
    }

    @Override
    public ComunicadoDestinatarioEntity delete(Long id) {
        return null;
    }

    @Override
    public ComunicadoDestinatarioEntity enable(Long id) {
        return null;
    }
}