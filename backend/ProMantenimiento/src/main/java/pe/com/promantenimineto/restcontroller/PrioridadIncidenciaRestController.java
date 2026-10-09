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

import pe.com.promantenimineto.entity.PrioridadIncidenciaEntity;
import pe.com.promantenimineto.service.PrioridadIncidenciaService;

@RestController
@RequestMapping("/api/prioridad-incidencia")
public class PrioridadIncidenciaRestController {

	@Autowired
	private PrioridadIncidenciaService servicio;
	
	@GetMapping
	public List<PrioridadIncidenciaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<PrioridadIncidenciaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public PrioridadIncidenciaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public PrioridadIncidenciaEntity add(@RequestBody PrioridadIncidenciaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public PrioridadIncidenciaEntity update(@RequestBody PrioridadIncidenciaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public PrioridadIncidenciaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public PrioridadIncidenciaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
