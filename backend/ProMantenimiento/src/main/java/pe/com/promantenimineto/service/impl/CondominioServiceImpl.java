package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.CondominioEntity;
import pe.com.promantenimineto.repository.CondominioRepository;
import pe.com.promantenimineto.service.CondominioService;

@Service
public class CondominioServiceImpl implements CondominioService{

    @Autowired
    private CondominioRepository repositorio;

    @Override
    public List<CondominioEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<CondominioEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public CondominioEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public CondominioEntity add(CondominioEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public CondominioEntity update(CondominioEntity obj, Long id) {
        CondominioEntity objCondominio = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objCondominio);
        return repositorio.save(objCondominio);
    }

    @Override
    public CondominioEntity delete(Long id) {
        CondominioEntity objCondominio = repositorio.findById(id).get();
        objCondominio.setActivo(false);
        return repositorio.save(objCondominio);
    }

    @Override
    public CondominioEntity enable(Long id) {
        CondominioEntity objCondominio = repositorio.findById(id).get();
        objCondominio.setActivo(true);
        return repositorio.save(objCondominio);
    }
}