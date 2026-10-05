package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.TipoEvidenciaEntity;
import pe.com.promantenimineto.repository.TipoEvidenciaRepository;
import pe.com.promantenimineto.service.TipoEvidenciaService;

@Service
public class TipoEvidenciaServiceImpl implements TipoEvidenciaService{

    @Autowired
    private TipoEvidenciaRepository repositorio;

    @Override
    public List<TipoEvidenciaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<TipoEvidenciaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public TipoEvidenciaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public TipoEvidenciaEntity add(TipoEvidenciaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public TipoEvidenciaEntity update(TipoEvidenciaEntity obj, Long id) {
        TipoEvidenciaEntity objTipoEvidencia = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objTipoEvidencia);
        return repositorio.save(objTipoEvidencia);
    }

    @Override
    public TipoEvidenciaEntity delete(Long id) {
        TipoEvidenciaEntity objTipoEvidencia = repositorio.findById(id).get();
        objTipoEvidencia.setActivo(false);
        return repositorio.save(objTipoEvidencia);
    }

    @Override
    public TipoEvidenciaEntity enable(Long id) {
        TipoEvidenciaEntity objTipoEvidencia = repositorio.findById(id).get();
        objTipoEvidencia.setActivo(true);
        return repositorio.save(objTipoEvidencia);
    }
}