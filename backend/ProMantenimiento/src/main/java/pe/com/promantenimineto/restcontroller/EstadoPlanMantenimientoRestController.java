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

import pe.com.promantenimineto.entity.EstadoPlanMantenimientoEntity;
import pe.com.promantenimineto.service.EstadoPlanMantenimientoService;

@RestController
@RequestMapping("/api/estado-plan-mantenimiento")
public class EstadoPlanMantenimientoRestController {
	@Autowired
	private EstadoPlanMantenimientoService servicio;
	
	@GetMapping
	public List<EstadoPlanMantenimientoEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<EstadoPlanMantenimientoEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public EstadoPlanMantenimientoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public EstadoPlanMantenimientoEntity add(@RequestBody EstadoPlanMantenimientoEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public EstadoPlanMantenimientoEntity update(@RequestBody EstadoPlanMantenimientoEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public EstadoPlanMantenimientoEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public EstadoPlanMantenimientoEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
