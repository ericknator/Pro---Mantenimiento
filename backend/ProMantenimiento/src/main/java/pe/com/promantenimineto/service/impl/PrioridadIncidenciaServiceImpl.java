package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.PrioridadIncidenciaEntity;
import pe.com.promantenimineto.repository.PrioridadIncidenciaRepository;
import pe.com.promantenimineto.service.PrioridadIncidenciaService;

@Service
public class PrioridadIncidenciaServiceImpl implements PrioridadIncidenciaService{

    @Autowired
    private PrioridadIncidenciaRepository repositorio;

    @Override
    public List<PrioridadIncidenciaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<PrioridadIncidenciaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public PrioridadIncidenciaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public PrioridadIncidenciaEntity add(PrioridadIncidenciaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public PrioridadIncidenciaEntity update(PrioridadIncidenciaEntity obj, Long id) {
        PrioridadIncidenciaEntity objPrioridadIncidencia = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objPrioridadIncidencia);
        return repositorio.save(objPrioridadIncidencia);
    }

    @Override
    public PrioridadIncidenciaEntity delete(Long id) {
        PrioridadIncidenciaEntity objPrioridadIncidencia = repositorio.findById(id).get();
        objPrioridadIncidencia.setActivo(false);
        return repositorio.save(objPrioridadIncidencia);
    }

    @Override
    public PrioridadIncidenciaEntity enable(Long id) {
        PrioridadIncidenciaEntity objPrioridadIncidencia = repositorio.findById(id).get();
        objPrioridadIncidencia.setActivo(true);
        return repositorio.save(objPrioridadIncidencia);
    }
}