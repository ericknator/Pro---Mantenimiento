package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.EvidenciaIncidenciaEntity;
import pe.com.promantenimineto.repository.EvidenciaIncidenciaRepository;
import pe.com.promantenimineto.service.EvidenciaIncidenciaService;

@Service
public class EvidenciaIncidenciaServiceImpl implements EvidenciaIncidenciaService{

    @Autowired
    private EvidenciaIncidenciaRepository repositorio;

    @Override
    public List<EvidenciaIncidenciaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<EvidenciaIncidenciaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public EvidenciaIncidenciaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public EvidenciaIncidenciaEntity add(EvidenciaIncidenciaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public EvidenciaIncidenciaEntity update(EvidenciaIncidenciaEntity obj, Long id) {
        EvidenciaIncidenciaEntity objEvidenciaIncidencia = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objEvidenciaIncidencia);
        return repositorio.save(objEvidenciaIncidencia);
    }

    @Override
    public EvidenciaIncidenciaEntity delete(Long id) {
        return null;
    }

    @Override
    public EvidenciaIncidenciaEntity enable(Long id) {
        return null;
    }
}