package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.AccesoVisitaEntity;
import pe.com.promantenimineto.repository.AccesoVisitaRepository;
import pe.com.promantenimineto.service.AccesoVisitaService;

@Service
public class AccesoVisitaServiceImpl implements AccesoVisitaService{

    @Autowired
    private AccesoVisitaRepository repositorio;

    @Override
    public List<AccesoVisitaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<AccesoVisitaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public AccesoVisitaEntity findById(Long id) {
        return repositorio.findById(id).get();
    }

    @Override
    public AccesoVisitaEntity add(AccesoVisitaEntity obj) {
        return repositorio.save(obj);
    }

    @Override
    public AccesoVisitaEntity update(AccesoVisitaEntity obj, Long id) {
        AccesoVisitaEntity objAccesoVisita = repositorio.findById(id).get();
        BeanUtils.copyProperties(obj, objAccesoVisita);
        return repositorio.save(objAccesoVisita);
    }

	@Override
	public AccesoVisitaEntity delete(Long id) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public AccesoVisitaEntity enable(Long id) {
		// TODO Auto-generated method stub
		return null;
	}
}