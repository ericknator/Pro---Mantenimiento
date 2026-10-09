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

import pe.com.promantenimineto.entity.VisitaEntity;
import pe.com.promantenimineto.service.VisitaService;

@RestController
@RequestMapping("/api/visita")
public class VisitaRestController {

	@Autowired
	private VisitaService servicio;
	
	@GetMapping
	public List<VisitaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<VisitaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public VisitaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public VisitaEntity add(@RequestBody VisitaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public VisitaEntity update(@RequestBody VisitaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public VisitaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public VisitaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
