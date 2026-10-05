package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.PlanMantenimientoEntity;
import pe.com.promantenimineto.repository.PlanMantenimientoRepository;
import pe.com.promantenimineto.service.PlanMantenimientoService;

@Service
public class PlanMantenimientoServiceImpl implements PlanMantenimientoService{

    @Autowired
    private PlanMantenimientoRepository repositorio;

    @Override
    public List<PlanMantenimientoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<PlanMantenimientoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public PlanMantenimientoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public PlanMantenimientoEntity add(PlanMantenimientoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public PlanMantenimientoEntity update(PlanMantenimientoEntity obj, Long id) {
        PlanMantenimientoEntity objPlanMantenimiento = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objPlanMantenimiento);
        return repositorio.save(objPlanMantenimiento);
    }

    @Override
    public PlanMantenimientoEntity delete(Long id) {
        return null;
    }

    @Override
    public PlanMantenimientoEntity enable(Long id) {
        return null;
    }
}