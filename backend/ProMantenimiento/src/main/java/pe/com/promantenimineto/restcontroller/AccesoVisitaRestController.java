package pe.com.promantenimineto.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import pe.com.promantenimineto.entity.AccesoVisitaEntity;
import pe.com.promantenimineto.service.AccesoVisitaService;

@RestController
@RequestMapping("/api/acceso-visita")
public class AccesoVisitaRestController {

    @Autowired
    private AccesoVisitaService servicio;

    @GetMapping
    public List<AccesoVisitaEntity> findAll() {
        return servicio.findAll();
    }

    @GetMapping("/custom")
    public List<AccesoVisitaEntity> findAllCustom() {
        return servicio.findAllCustom();
    }

    @GetMapping("/{id}")
    public AccesoVisitaEntity findById(@PathVariable Long id) {
        return servicio.findById(id);
    }

    @PostMapping
    public AccesoVisitaEntity add(@RequestBody AccesoVisitaEntity obj) {
        return servicio.add(obj);
    }

    @PutMapping("{id}")
    public AccesoVisitaEntity update(@RequestBody AccesoVisitaEntity obj, @PathVariable Long id) {
        return servicio.update(obj, id);
    }

    @DeleteMapping("/{id}")
    public AccesoVisitaEntity delete(@PathVariable Long id) {
        return servicio.delete(id);
    }

    @PatchMapping("{id}")
    public AccesoVisitaEntity enable(@PathVariable Long id) {
        return servicio.enable(id);
    }

}