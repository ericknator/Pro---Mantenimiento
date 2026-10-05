package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.TipoNotificacionEntity;
import pe.com.promantenimineto.repository.TipoNotificacionRepository;
import pe.com.promantenimineto.service.TipoNotificacionService;

@Service
public class TipoNotificacionServiceImpl implements TipoNotificacionService{

    @Autowired
    private TipoNotificacionRepository repositorio;

    @Override
    public List<TipoNotificacionEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<TipoNotificacionEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public TipoNotificacionEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public TipoNotificacionEntity add(TipoNotificacionEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public TipoNotificacionEntity update(TipoNotificacionEntity obj, Long id) {
        TipoNotificacionEntity objTipoNotificacion = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objTipoNotificacion);
        return repositorio.save(objTipoNotificacion);
    }

    @Override
    public TipoNotificacionEntity delete(Long id) {
        TipoNotificacionEntity objTipoNotificacion = repositorio.findById(id).get();
        objTipoNotificacion.setActivo(false);
        return repositorio.save(objTipoNotificacion);
    }

    @Override
    public TipoNotificacionEntity enable(Long id) {
        TipoNotificacionEntity objTipoNotificacion = repositorio.findById(id).get();
        objTipoNotificacion.setActivo(true);
        return repositorio.save(objTipoNotificacion);
    }
}