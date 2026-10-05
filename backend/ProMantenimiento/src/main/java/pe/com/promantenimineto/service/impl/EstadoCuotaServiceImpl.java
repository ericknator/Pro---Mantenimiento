package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.EstadoCuotaEntity;
import pe.com.promantenimineto.repository.EstadoCuotaRepository;
import pe.com.promantenimineto.service.EstadoCuotaService;

@Service
public class EstadoCuotaServiceImpl implements EstadoCuotaService{

    @Autowired
    private EstadoCuotaRepository repositorio;

    @Override
    public List<EstadoCuotaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<EstadoCuotaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public EstadoCuotaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public EstadoCuotaEntity add(EstadoCuotaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public EstadoCuotaEntity update(EstadoCuotaEntity obj, Long id) {
        EstadoCuotaEntity objEstadoCuota = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objEstadoCuota);
        return repositorio.save(objEstadoCuota);
    }

    @Override
    public EstadoCuotaEntity delete(Long id) {
        EstadoCuotaEntity objEstadoCuota = repositorio.findById(id).get();
        objEstadoCuota.setActivo(false);
        return repositorio.save(objEstadoCuota);
    }

    @Override
    public EstadoCuotaEntity enable(Long id) {
        EstadoCuotaEntity objEstadoCuota = repositorio.findById(id).get();
        objEstadoCuota.setActivo(true);
        return repositorio.save(objEstadoCuota);
    }
}