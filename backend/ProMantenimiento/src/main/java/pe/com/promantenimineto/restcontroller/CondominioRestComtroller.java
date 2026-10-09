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

import pe.com.promantenimineto.entity.CondominioEntity;
import pe.com.promantenimineto.service.CondominioService;

@RestController
@RequestMapping("/api/condominio")
public class CondominioRestComtroller {

	@Autowired
	private CondominioService servicio;
	
	@GetMapping
	public List<CondominioEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<CondominioEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public CondominioEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public CondominioEntity add(@RequestBody CondominioEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public CondominioEntity update(@RequestBody CondominioEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping("{id}")
	public CondominioEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public CondominioEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
