package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.CategoriaIncidenciaEntity;
import pe.com.promantenimineto.repository.CategoriaIncidenciaRepository;
import pe.com.promantenimineto.service.CategoriaIncidenciaService;

@Service
public class CategoriaIncidenciaServiceImpl implements CategoriaIncidenciaService{

    @Autowired
    private CategoriaIncidenciaRepository repositorio;

    @Override
    public List<CategoriaIncidenciaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<CategoriaIncidenciaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public CategoriaIncidenciaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public CategoriaIncidenciaEntity add(CategoriaIncidenciaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public CategoriaIncidenciaEntity update(CategoriaIncidenciaEntity obj, Long id) {
        CategoriaIncidenciaEntity objCategoriaIncidencia = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objCategoriaIncidencia);
        return repositorio.save(objCategoriaIncidencia);
    }

    @Override
    public CategoriaIncidenciaEntity delete(Long id) {
        CategoriaIncidenciaEntity objCategoriaIncidencia = repositorio.findById(id).get();
        objCategoriaIncidencia.setActivo(false);
        return repositorio.save(objCategoriaIncidencia);
    }

    @Override
    public CategoriaIncidenciaEntity enable(Long id) {
        CategoriaIncidenciaEntity objCategoriaIncidencia = repositorio.findById(id).get();
        objCategoriaIncidencia.setActivo(true);
        return repositorio.save(objCategoriaIncidencia);
    }
}