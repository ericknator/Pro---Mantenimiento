package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.IntervencionPreventivaEntity;
import pe.com.promantenimineto.repository.IntervencionPreventivaRepository;
import pe.com.promantenimineto.service.IntervencionPreventivaService;

@Service
public class IntervencionPreventivaServiceImpl implements IntervencionPreventivaService{

    @Autowired
    private IntervencionPreventivaRepository repositorio;

    @Override
    public List<IntervencionPreventivaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<IntervencionPreventivaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public IntervencionPreventivaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public IntervencionPreventivaEntity add(IntervencionPreventivaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public IntervencionPreventivaEntity update(IntervencionPreventivaEntity obj, Long id) {
        IntervencionPreventivaEntity objIntervencionPreventiva = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objIntervencionPreventiva);
        return repositorio.save(objIntervencionPreventiva);
    }

    @Override
    public IntervencionPreventivaEntity delete(Long id) {
        return null;
    }

    @Override
    public IntervencionPreventivaEntity enable(Long id) {
        return null;
    }
}