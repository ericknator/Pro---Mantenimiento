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

import pe.com.promantenimineto.entity.TorreEntity;
import pe.com.promantenimineto.service.TorreService;

@RestController
@RequestMapping("/api/torre")
public class TorreRestController {

	@Autowired
	private TorreService servicio;
	
	@GetMapping
	public List<TorreEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<TorreEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public TorreEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public TorreEntity add(@RequestBody TorreEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public TorreEntity update(@RequestBody TorreEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public TorreEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public TorreEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
