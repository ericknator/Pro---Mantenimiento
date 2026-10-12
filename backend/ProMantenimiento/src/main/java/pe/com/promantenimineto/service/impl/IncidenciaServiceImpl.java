package pe.com.promantenimineto.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pe.com.promantenimineto.entity.IncidenciaEntity;
import pe.com.promantenimineto.repository.CategoriaIncidenciaRepository;
import pe.com.promantenimineto.repository.EstadoIncidenciaRepository;
import pe.com.promantenimineto.repository.IncidenciaRepository;
import pe.com.promantenimineto.repository.PrioridadIncidenciaRepository;
import pe.com.promantenimineto.service.IncidenciaService;

@Service
public class IncidenciaServiceImpl implements IncidenciaService{

    @Autowired
    private IncidenciaRepository repositorio;
    
    @Autowired
    private CategoriaIncidenciaRepository categoriaRepositorio;

    @Autowired
    private PrioridadIncidenciaRepository prioridadRepositorio;

    @Autowired
    private EstadoIncidenciaRepository estadoRepositorio;
    
    private String generarCodigo() {
        int anio = LocalDate.now().getYear();
        int correlativo = repositorio.obtenerUltimoCorrelativo(anio) + 1;

        return String.format(
            Locale.ROOT,
            "INC-%d-%04d",
            anio,
            correlativo
        );
    }
    

    @Override
    public List<IncidenciaEntity> findAll() {
        return repositorio.findAll();
    }

    @Override
    public List<IncidenciaEntity> findAllCustom() {
        return repositorio.findAllCustom();
    }

    @Override
    public IncidenciaEntity findById(Long id) {
        return repositorio.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Incidencia no encontrada"
                ));
    }

    @Override
    public IncidenciaEntity add(IncidenciaEntity obj) {
    	 // Validar categoría
        if (obj.getCategoria() == null
                || obj.getCategoria().getId() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La categoría es obligatoria"
            );
        }

        // Validar prioridad
        if (obj.getPrioridad() == null
                || obj.getPrioridad().getId() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "La prioridad es obligatoria"
            );
        }

        // Validar estado
        if (obj.getEstado() == null
                || obj.getEstado().getId() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El estado es obligatorio"
            );
        }

        // Buscar las entidades reales en la base de datos
        Long categoriaId = obj.getCategoria().getId();
        Long prioridadId = obj.getPrioridad().getId();
        Long estadoId = obj.getEstado().getId();

        obj.setCategoria(
            categoriaRepositorio.findById(categoriaId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La categoría indicada no existe"
                ))
        );

        obj.setPrioridad(
            prioridadRepositorio.findById(prioridadId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La prioridad indicada no existe"
                ))
        );

        obj.setEstado(
            estadoRepositorio.findById(estadoId)
                .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El estado indicado no existe"
                ))
        );

        // Completar fechas si no fueron enviadas
        LocalDateTime ahora = LocalDateTime.now();
        
        obj.setCodigo(generarCodigo());

        if (obj.getFechaReporte() == null) {
            obj.setFechaReporte(ahora);
        }

        if (obj.getCreadoEn() == null) {
            obj.setCreadoEn(ahora);
        }

        if (obj.getActualizadoEn() == null) {
            obj.setActualizadoEn(ahora);
        }
        
        return repositorio.save(obj);
    }

    @Override
    public IncidenciaEntity update(IncidenciaEntity obj, Long id) {
    	 IncidenciaEntity existente = repositorio.findById(id)
    		        .orElseThrow(() -> new ResponseStatusException(
    		            HttpStatus.NOT_FOUND,
    		            "Incidencia no encontrada"
    		        ));

    		    // Copiar los campos, conservando los datos que no deben cambiar
    		    BeanUtils.copyProperties(
    		        obj,
    		        existente,
    		        "id",
    		        "codigo",
    		        "fechaReporte",
    		        "creadoEn"
    		    );

    		    // Actualizar la fecha de modificación
    		    existente.setActualizadoEn(LocalDateTime.now());

    		    return repositorio.save(existente);
    }

    @Override
    public IncidenciaEntity delete(Long id) {
        return null;
    }

    @Override
    public IncidenciaEntity enable(Long id) {
        return null;
    }
}