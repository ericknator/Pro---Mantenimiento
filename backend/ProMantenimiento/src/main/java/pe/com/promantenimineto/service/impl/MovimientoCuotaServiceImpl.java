package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.MovimientoCuotaEntity;
import pe.com.promantenimineto.repository.MovimientoCuotaRepository;
import pe.com.promantenimineto.service.MovimientoCuotaService;

@Service
public class MovimientoCuotaServiceImpl implements MovimientoCuotaService{

    @Autowired
    private MovimientoCuotaRepository repositorio;

    @Override
    public List<MovimientoCuotaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<MovimientoCuotaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public MovimientoCuotaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public MovimientoCuotaEntity add(MovimientoCuotaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public MovimientoCuotaEntity update(MovimientoCuotaEntity obj, Long id) {
        MovimientoCuotaEntity objMovimientoCuota = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objMovimientoCuota);
        return repositorio.save(objMovimientoCuota);
    }

    @Override
    public MovimientoCuotaEntity delete(Long id) {
        return null;
    }

    @Override
    public MovimientoCuotaEntity enable(Long id) {
        return null;
    }
}