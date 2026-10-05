package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.ComunicadoEntity;
import pe.com.promantenimineto.repository.ComunicadoRepository;
import pe.com.promantenimineto.service.ComunicadoService;

@Service
public class ComunicadoServiceImpl implements ComunicadoService{

    @Autowired
    private ComunicadoRepository repositorio;

    @Override
    public List<ComunicadoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<ComunicadoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public ComunicadoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public ComunicadoEntity add(ComunicadoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public ComunicadoEntity update(ComunicadoEntity obj, Long id) {
        ComunicadoEntity objComunicado = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objComunicado);
        return repositorio.save(objComunicado);
    }

    @Override
    public ComunicadoEntity delete(Long id) {
        ComunicadoEntity objComunicado = repositorio.findById(id).get();
        objComunicado.setActivo(false);
        return repositorio.save(objComunicado);
    }

    @Override
    public ComunicadoEntity enable(Long id) {
        ComunicadoEntity objComunicado = repositorio.findById(id).get();
        objComunicado.setActivo(true);
        return repositorio.save(objComunicado);
    }
}