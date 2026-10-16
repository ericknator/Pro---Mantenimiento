package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.TipoActivoEntity;
import pe.com.promantenimineto.repository.TipoActivoRepository;
import pe.com.promantenimineto.service.TipoActivoService;

@Service
public class TipoActivoServiceImpl implements TipoActivoService{

    @Autowired
    private TipoActivoRepository repositorio;

    @Override
    public List<TipoActivoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<TipoActivoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public TipoActivoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public TipoActivoEntity add(TipoActivoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public TipoActivoEntity update(TipoActivoEntity obj, Long id) {
        TipoActivoEntity objTipoActivo = repositorio.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de activo no encontrado con ID: " + id));

        BeanUtils.copyProperties(obj, objTipoActivo, "id");

        return repositorio.save(objTipoActivo);
    }

    @Override
    public TipoActivoEntity delete(Long id) {
        TipoActivoEntity objTipoActivo = repositorio.findById(id).get();
        objTipoActivo.setActivo(false);
        return repositorio.save(objTipoActivo);
    }

    @Override
    public TipoActivoEntity enable(Long id) {
        TipoActivoEntity objTipoActivo = repositorio.findById(id).get();
        objTipoActivo.setActivo(true);
        return repositorio.save(objTipoActivo);
    }
}