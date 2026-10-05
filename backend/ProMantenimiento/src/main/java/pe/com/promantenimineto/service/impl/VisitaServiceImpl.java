package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.VisitaEntity;
import pe.com.promantenimineto.repository.VisitaRepository;
import pe.com.promantenimineto.service.VisitaService;

@Service
public class VisitaServiceImpl implements VisitaService{

    @Autowired
    private VisitaRepository repositorio;

    @Override
    public List<VisitaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<VisitaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public VisitaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public VisitaEntity add(VisitaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public VisitaEntity update(VisitaEntity obj, Long id) {
        VisitaEntity objVisita = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objVisita);
        return repositorio.save(objVisita);
    }

    @Override
    public VisitaEntity delete(Long id) {
        return null;
    }

    @Override
    public VisitaEntity enable(Long id) {
        return null;
    }
}