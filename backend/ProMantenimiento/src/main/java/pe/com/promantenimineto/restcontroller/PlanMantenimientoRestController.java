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

import pe.com.promantenimineto.entity.PlanMantenimientoEntity;
import pe.com.promantenimineto.service.PlanMantenimientoService;

@RestController
@RequestMapping("/api/plan-mantenimiento")
public class PlanMantenimientoRestController {

	@Autowired
	private PlanMantenimientoService servicio;
	
	@GetMapping
	public List<PlanMantenimientoEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<PlanMantenimientoEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public PlanMantenimientoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public PlanMantenimientoEntity add(@RequestBody PlanMantenimientoEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public PlanMantenimientoEntity update(@RequestBody PlanMantenimientoEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public PlanMantenimientoEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public PlanMantenimientoEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
