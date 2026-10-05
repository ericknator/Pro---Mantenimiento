package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.ParametroSistemaEntity;
import pe.com.promantenimineto.repository.ParametroSistemaRepository;
import pe.com.promantenimineto.service.ParametroSistemaService;

@Service
public class ParametroSistemaServiceImpl implements ParametroSistemaService{

    @Autowired
    private ParametroSistemaRepository repositorio;

    @Override
    public List<ParametroSistemaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<ParametroSistemaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public ParametroSistemaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public ParametroSistemaEntity add(ParametroSistemaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public ParametroSistemaEntity update(ParametroSistemaEntity obj, Long id) {
        ParametroSistemaEntity objParametroSistema = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objParametroSistema);
        return repositorio.save(objParametroSistema);
    }

    @Override
    public ParametroSistemaEntity delete(Long id) {
        return null;
    }

    @Override
    public ParametroSistemaEntity enable(Long id) {
        return null;
    }
}