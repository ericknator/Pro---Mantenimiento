package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.AuditoriaSistemaEntity;
import pe.com.promantenimineto.repository.AuditoriaSistemaRepository;
import pe.com.promantenimineto.service.AuditoriaSistemaService;

@Service
public class AuditoriaSistemaServiceImpl implements AuditoriaSistemaService{

    @Autowired
    private AuditoriaSistemaRepository repositorio;

    @Override
    public List<AuditoriaSistemaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<AuditoriaSistemaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public AuditoriaSistemaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public AuditoriaSistemaEntity add(AuditoriaSistemaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public AuditoriaSistemaEntity update(AuditoriaSistemaEntity obj, Long id) {
        AuditoriaSistemaEntity objAuditoriaSistema = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objAuditoriaSistema);
        return repositorio.save(objAuditoriaSistema);
    }

    @Override
    public AuditoriaSistemaEntity delete(Long id) {
        return null;
    }

    @Override
    public AuditoriaSistemaEntity enable(Long id) {
        return null;
    }
}