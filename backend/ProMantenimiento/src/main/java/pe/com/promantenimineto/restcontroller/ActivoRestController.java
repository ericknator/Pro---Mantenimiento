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

import pe.com.promantenimineto.entity.ActivoEntity;
import pe.com.promantenimineto.service.ActivoService;

@RestController
@RequestMapping("/api/activo")
public class ActivoRestController {

	@Autowired
	private ActivoService servicio;
	
	@GetMapping
	public List<ActivoEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<ActivoEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public ActivoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public ActivoEntity add(@RequestBody ActivoEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public ActivoEntity update(@RequestBody ActivoEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public ActivoEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public ActivoEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
