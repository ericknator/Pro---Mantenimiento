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

import pe.com.promantenimineto.entity.EstadoActivoEntity;
import pe.com.promantenimineto.service.EstadoActivoService;

@RestController
@RequestMapping("/api/estado-activo")
public class EstadoActivoRestController {

	@Autowired
	private EstadoActivoService servicio;
	
	@GetMapping
	public List<EstadoActivoEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<EstadoActivoEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public EstadoActivoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public EstadoActivoEntity add(@RequestBody EstadoActivoEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public EstadoActivoEntity update(@RequestBody EstadoActivoEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping("{id}")
	public EstadoActivoEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public EstadoActivoEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
