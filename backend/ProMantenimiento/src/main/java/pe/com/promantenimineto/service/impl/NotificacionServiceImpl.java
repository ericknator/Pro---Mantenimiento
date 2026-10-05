package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.NotificacionEntity;
import pe.com.promantenimineto.repository.NotificacionRepository;
import pe.com.promantenimineto.service.NotificacionService;

@Service
public class NotificacionServiceImpl implements NotificacionService{

    @Autowired
    private NotificacionRepository repositorio;

    @Override
    public List<NotificacionEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<NotificacionEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public NotificacionEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public NotificacionEntity add(NotificacionEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public NotificacionEntity update(NotificacionEntity obj, Long id) {
        NotificacionEntity objNotificacion = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objNotificacion);
        return repositorio.save(objNotificacion);
    }

    @Override
    public NotificacionEntity delete(Long id) {
        return null;
    }

    @Override
    public NotificacionEntity enable(Long id) {
        return null;
    }
}