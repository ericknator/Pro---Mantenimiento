package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.DocumentoPagoEntity;
import pe.com.promantenimineto.repository.DocumentoPagoRepository;
import pe.com.promantenimineto.service.DocumentoPagoService;

@Service
public class DocumentoPagoServiceImpl implements DocumentoPagoService{

    @Autowired
    private DocumentoPagoRepository repositorio;

    @Override
    public List<DocumentoPagoEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<DocumentoPagoEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public DocumentoPagoEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public DocumentoPagoEntity add(DocumentoPagoEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public DocumentoPagoEntity update(DocumentoPagoEntity obj, Long id) {
        DocumentoPagoEntity objDocumentoPago = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objDocumentoPago);
        return repositorio.save(objDocumentoPago);
    }

    @Override
    public DocumentoPagoEntity delete(Long id) {
        return null;
    }

    @Override
    public DocumentoPagoEntity enable(Long id) {
        return null;
    }
}