package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.EstadoVisitaEntity;
import pe.com.promantenimineto.repository.EstadoVisitaRepository;
import pe.com.promantenimineto.service.EstadoVisitaService;

@Service
public class EstadoVisitaServiceImpl implements EstadoVisitaService{

    @Autowired
    private EstadoVisitaRepository repositorio;

    @Override
    public List<EstadoVisitaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<EstadoVisitaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public EstadoVisitaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public EstadoVisitaEntity add(EstadoVisitaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public EstadoVisitaEntity update(EstadoVisitaEntity obj, Long id) {
        EstadoVisitaEntity objEstadoVisita = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objEstadoVisita);
        return repositorio.save(objEstadoVisita);
    }

    @Override
    public EstadoVisitaEntity delete(Long id) {
        EstadoVisitaEntity objEstadoVisita = repositorio.findById(id).get();
        objEstadoVisita.setActivo(false);
        return repositorio.save(objEstadoVisita);
    }

    @Override
    public EstadoVisitaEntity enable(Long id) {
        EstadoVisitaEntity objEstadoVisita = repositorio.findById(id).get();
        objEstadoVisita.setActivo(true);
        return repositorio.save(objEstadoVisita);
    }
}