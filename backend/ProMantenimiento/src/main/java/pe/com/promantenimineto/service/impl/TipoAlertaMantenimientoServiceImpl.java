package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.TipoAlertaMantenimientoEntity;
import pe.com.promantenimineto.repository.TipoAlertaMantenimientoRepository;
import pe.com.promantenimineto.service.TipoAlertaMantenimientoService;

@Service
public class TipoAlertaMantenimientoServiceImpl implements TipoAlertaMantenimientoService{

    @Autowired
    private TipoAlertaMantenimientoRepository repositorio;

    @Override
    public List<TipoAlertaMantenimientoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<TipoAlertaMantenimientoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public TipoAlertaMantenimientoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public TipoAlertaMantenimientoEntity add(TipoAlertaMantenimientoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public TipoAlertaMantenimientoEntity update(TipoAlertaMantenimientoEntity obj, Long id) {
        TipoAlertaMantenimientoEntity objTipoAlertaMantenimiento = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objTipoAlertaMantenimiento);
        return repositorio.save(objTipoAlertaMantenimiento);
    }

    @Override
    public TipoAlertaMantenimientoEntity delete(Long id) {
        TipoAlertaMantenimientoEntity objTipoAlertaMantenimiento = repositorio.findById(id).get();
        objTipoAlertaMantenimiento.setActivo(false);
        return repositorio.save(objTipoAlertaMantenimiento);
    }

    @Override
    public TipoAlertaMantenimientoEntity enable(Long id) {
        TipoAlertaMantenimientoEntity objTipoAlertaMantenimiento = repositorio.findById(id).get();
        objTipoAlertaMantenimiento.setActivo(true);
        return repositorio.save(objTipoAlertaMantenimiento);
    }
}