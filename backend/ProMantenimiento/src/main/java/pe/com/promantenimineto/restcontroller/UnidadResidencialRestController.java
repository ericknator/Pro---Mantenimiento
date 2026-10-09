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

import pe.com.promantenimineto.entity.UnidadResidencialEntity;
import pe.com.promantenimineto.service.UnidadResidencialService;

@RestController
@RequestMapping("/api/unidad-residencial")
public class UnidadResidencialRestController {

	@Autowired
	private UnidadResidencialService servicio;
	
	@GetMapping
	public List<UnidadResidencialEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<UnidadResidencialEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public UnidadResidencialEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public UnidadResidencialEntity add(@RequestBody UnidadResidencialEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public UnidadResidencialEntity update(@RequestBody UnidadResidencialEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping("{id}")
	public UnidadResidencialEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public UnidadResidencialEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
