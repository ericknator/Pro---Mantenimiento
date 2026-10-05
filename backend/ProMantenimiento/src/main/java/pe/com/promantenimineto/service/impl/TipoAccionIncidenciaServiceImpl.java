package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.TipoAccionIncidenciaEntity;
import pe.com.promantenimineto.repository.TipoAccionIncidenciaRepository;
import pe.com.promantenimineto.service.TipoAccionIncidenciaService;

@Service
public class TipoAccionIncidenciaServiceImpl implements TipoAccionIncidenciaService{

    @Autowired
    private TipoAccionIncidenciaRepository repositorio;

    @Override
    public List<TipoAccionIncidenciaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<TipoAccionIncidenciaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public TipoAccionIncidenciaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public TipoAccionIncidenciaEntity add(TipoAccionIncidenciaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public TipoAccionIncidenciaEntity update(TipoAccionIncidenciaEntity obj, Long id) {
        TipoAccionIncidenciaEntity objTipoAccionIncidencia = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objTipoAccionIncidencia);
        return repositorio.save(objTipoAccionIncidencia);
    }

    @Override
    public TipoAccionIncidenciaEntity delete(Long id) {
        TipoAccionIncidenciaEntity objTipoAccionIncidencia = repositorio.findById(id).get();
        objTipoAccionIncidencia.setActivo(false);
        return repositorio.save(objTipoAccionIncidencia);
    }

    @Override
    public TipoAccionIncidenciaEntity enable(Long id) {
        TipoAccionIncidenciaEntity objTipoAccionIncidencia = repositorio.findById(id).get();
        objTipoAccionIncidencia.setActivo(true);
        return repositorio.save(objTipoAccionIncidencia);
    }
}