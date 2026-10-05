package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.TareaPreventivaEntity;
import pe.com.promantenimineto.repository.TareaPreventivaRepository;
import pe.com.promantenimineto.service.TareaPreventivaService;

@Service
public class TareaPreventivaServiceImpl implements TareaPreventivaService{

    @Autowired
    private TareaPreventivaRepository repositorio;

    @Override
    public List<TareaPreventivaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<TareaPreventivaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public TareaPreventivaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public TareaPreventivaEntity add(TareaPreventivaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public TareaPreventivaEntity update(TareaPreventivaEntity obj, Long id) {
        TareaPreventivaEntity objTareaPreventiva = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objTareaPreventiva);
        return repositorio.save(objTareaPreventiva);
    }

    @Override
    public TareaPreventivaEntity delete(Long id) {
        return null;
    }

    @Override
    public TareaPreventivaEntity enable(Long id) {
        return null;
    }
}