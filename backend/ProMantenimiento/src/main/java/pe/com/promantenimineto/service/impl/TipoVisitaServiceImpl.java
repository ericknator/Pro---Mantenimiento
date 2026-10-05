package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.TipoVisitaEntity;
import pe.com.promantenimineto.repository.TipoVisitaRepository;
import pe.com.promantenimineto.service.TipoVisitaService;

@Service
public class TipoVisitaServiceImpl implements TipoVisitaService{

    @Autowired
    private TipoVisitaRepository repositorio;

    @Override
    public List<TipoVisitaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<TipoVisitaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public TipoVisitaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public TipoVisitaEntity add(TipoVisitaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public TipoVisitaEntity update(TipoVisitaEntity obj, Long id) {
        TipoVisitaEntity objTipoVisita = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objTipoVisita);
        return repositorio.save(objTipoVisita);
    }

    @Override
    public TipoVisitaEntity delete(Long id) {
        TipoVisitaEntity objTipoVisita = repositorio.findById(id).get();
        objTipoVisita.setActivo(false);
        return repositorio.save(objTipoVisita);
    }

    @Override
    public TipoVisitaEntity enable(Long id) {
        TipoVisitaEntity objTipoVisita = repositorio.findById(id).get();
        objTipoVisita.setActivo(true);
        return repositorio.save(objTipoVisita);
    }
}