package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.UnidadResidencialEntity;
import pe.com.promantenimineto.repository.UnidadResidencialRepository;
import pe.com.promantenimineto.service.UnidadResidencialService;

@Service
public class UnidadResidencialServiceImpl implements UnidadResidencialService{

    @Autowired
    private UnidadResidencialRepository repositorio;

    @Override
    public List<UnidadResidencialEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<UnidadResidencialEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public UnidadResidencialEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public UnidadResidencialEntity add(UnidadResidencialEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public UnidadResidencialEntity update(UnidadResidencialEntity obj, Long id) {
        UnidadResidencialEntity objUnidadResidencial = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objUnidadResidencial);
        return repositorio.save(objUnidadResidencial);
    }

    @Override
    public UnidadResidencialEntity delete(Long id) {
        UnidadResidencialEntity objUnidadResidencial = repositorio.findById(id).get();
        objUnidadResidencial.setActivo(false);
        return repositorio.save(objUnidadResidencial);
    }

    @Override
    public UnidadResidencialEntity enable(Long id) {
        UnidadResidencialEntity objUnidadResidencial = repositorio.findById(id).get();
        objUnidadResidencial.setActivo(true);
        return repositorio.save(objUnidadResidencial);
    }
}