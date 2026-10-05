package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.AlertaMantenimientoEntity;
import pe.com.promantenimineto.repository.AlertaMantenimientoRepository;
import pe.com.promantenimineto.service.AlertaMantenimientoService;

@Service
public class AlertaMantenimientoServiceImpl implements AlertaMantenimientoService{

    @Autowired
    private AlertaMantenimientoRepository repositorio;

    @Override
    public List<AlertaMantenimientoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<AlertaMantenimientoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public AlertaMantenimientoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public AlertaMantenimientoEntity add(AlertaMantenimientoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public AlertaMantenimientoEntity update(AlertaMantenimientoEntity obj, Long id) {
        AlertaMantenimientoEntity objAlertaMantenimiento = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objAlertaMantenimiento);
        return repositorio.save(objAlertaMantenimiento);
    }

    @Override
    public AlertaMantenimientoEntity delete(Long id) {
        return null;
    }

    @Override
    public AlertaMantenimientoEntity enable(Long id) {
        return null;
    }
}