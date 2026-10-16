package pe.com.promantenimineto.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.ActivoEntity;
import pe.com.promantenimineto.repository.ActivoRepository;
import pe.com.promantenimineto.service.ActivoService;

@Service
public class ActivoServiceImpl implements ActivoService {

    @Autowired
    private ActivoRepository repositorio;

    @Override
    public List<ActivoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<ActivoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public ActivoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public ActivoEntity add(ActivoEntity obj) {
        LocalDateTime ahora = LocalDateTime.now();

        obj.setCreadoEn(ahora);
        obj.setActualizadoEn(ahora);

        return repositorio.save(obj);
    }

    @Override
    public ActivoEntity update(ActivoEntity obj, Long id) {
        ActivoEntity objActivo = repositorio.findById(id).get();

        BeanUtils.copyProperties(obj, objActivo, "id", "creadoEn");

        objActivo.setActualizadoEn(LocalDateTime.now());

        return repositorio.save(objActivo);
    }

    @Override
    public ActivoEntity delete(Long id) {
        ActivoEntity objActivo = repositorio.findById(id).get();

        objActivo.setActivo(false);
        objActivo.setActualizadoEn(LocalDateTime.now());

        return repositorio.save(objActivo);
    }

    @Override
    public ActivoEntity enable(Long id) {
        ActivoEntity objActivo = repositorio.findById(id).get();

        objActivo.setActivo(true);
        objActivo.setActualizadoEn(LocalDateTime.now());

        return repositorio.save(objActivo);
    }
}