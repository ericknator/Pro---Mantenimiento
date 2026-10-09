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

import pe.com.promantenimineto.entity.EstadoCuotaEntity;
import pe.com.promantenimineto.service.EstadoCuotaService;

@RestController
@RequestMapping("/api/estado-cuota")
public class EstadoCuotaRestController {

	@Autowired
	private EstadoCuotaService servicio;
	
	@GetMapping
	public List<EstadoCuotaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<EstadoCuotaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public EstadoCuotaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public EstadoCuotaEntity add(@RequestBody EstadoCuotaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public EstadoCuotaEntity update(@RequestBody EstadoCuotaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public EstadoCuotaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public EstadoCuotaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
