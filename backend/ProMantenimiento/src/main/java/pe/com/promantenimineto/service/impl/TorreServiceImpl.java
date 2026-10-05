package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.TorreEntity;
import pe.com.promantenimineto.repository.TorreRepository;
import pe.com.promantenimineto.service.TorreService;

@Service
public class TorreServiceImpl implements TorreService{

    @Autowired
    private TorreRepository repositorio;

    @Override
    public List<TorreEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<TorreEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public TorreEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public TorreEntity add(TorreEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public TorreEntity update(TorreEntity obj, Long id) {
        TorreEntity objTorre = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objTorre);
        return repositorio.save(objTorre);
    }

    @Override
    public TorreEntity delete(Long id) {
        TorreEntity objTorre = repositorio.findById(id).get();
        objTorre.setActivo(false);
        return repositorio.save(objTorre);
    }

    @Override
    public TorreEntity enable(Long id) {
        TorreEntity objTorre = repositorio.findById(id).get();
        objTorre.setActivo(true);
        return repositorio.save(objTorre);
    }
}