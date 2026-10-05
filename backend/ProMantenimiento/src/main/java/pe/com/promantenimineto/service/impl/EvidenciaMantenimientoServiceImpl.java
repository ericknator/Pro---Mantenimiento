package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.EvidenciaMantenimientoEntity;
import pe.com.promantenimineto.repository.EvidenciaMantenimientoRepository;
import pe.com.promantenimineto.service.EvidenciaMantenimientoService;

@Service
public class EvidenciaMantenimientoServiceImpl implements EvidenciaMantenimientoService{

    @Autowired
    private EvidenciaMantenimientoRepository repositorio;

    @Override
    public List<EvidenciaMantenimientoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<EvidenciaMantenimientoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public EvidenciaMantenimientoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public EvidenciaMantenimientoEntity add(EvidenciaMantenimientoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public EvidenciaMantenimientoEntity update(EvidenciaMantenimientoEntity obj, Long id) {
        EvidenciaMantenimientoEntity objEvidenciaMantenimiento = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objEvidenciaMantenimiento);
        return repositorio.save(objEvidenciaMantenimiento);
    }

    @Override
    public EvidenciaMantenimientoEntity delete(Long id) {
        return null;
    }

    @Override
    public EvidenciaMantenimientoEntity enable(Long id) {
        return null;
    }
}