package pe.com.promantenimineto.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import pe.com.promantenimineto.entity.ActivoEntity;
import pe.com.promantenimineto.entity.EstadoActivoEntity;
import pe.com.promantenimineto.repository.ActivoRepository;
import pe.com.promantenimineto.repository.EstadoActivoRepository;
import pe.com.promantenimineto.service.ActivoService;

@Service
public class ActivoServiceImpl implements ActivoService {

    @Autowired
    private ActivoRepository repositorio;
    @Autowired
    private EstadoActivoRepository estadoActivoRepositorio;

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
    
    
    // 1. Generar código único automáticamente
    private String generarCodigoUnico() {
        String codigo;

        do {
            codigo = "ACT-" + UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 8)
                    .toUpperCase();
        } while (repositorio.existsByCodigo(codigo));

        return codigo;
    }

    public ActivoEntity add(ActivoEntity obj) {

        // 1. Obtiene código único generado
    	obj.setCodigo(generarCodigoUnico());

        // 2. Asignar el estado operativo inicial
        EstadoActivoEntity estadoInicial = estadoActivoRepositorio
                .findByCodigoAndActivoTrue("OPERATIVO")
                .orElseThrow(() -> new IllegalStateException(
                        "No existe un estado activo con código OPERATIVO"));

        obj.setEstadoActivo(estadoInicial);

        // 3. Establecer valores predeterminados
        obj.setActivo(true);

        if (obj.getEsCritico() == null) {
            obj.setEsCritico(false);
        }

        // 4. Asignar fechas de auditoría
        LocalDateTime ahora = LocalDateTime.now();

        obj.setCreadoEn(ahora);
        obj.setActualizadoEn(ahora);

        // 5. Guardar el activo
        return repositorio.save(obj);
    }

    @Override
    public ActivoEntity update(ActivoEntity obj, Long id) {
        ActivoEntity objActivo = repositorio.findById(id).get();

        BeanUtils.copyProperties(
                obj,
                objActivo,
                "id",
                "codigo",
                "estadoActivo",
                "activo",
                "creadoEn"
        );

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