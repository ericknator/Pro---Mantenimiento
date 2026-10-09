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

import pe.com.promantenimineto.entity.IntervencionPreventivaEntity;
import pe.com.promantenimineto.service.IntervencionPreventivaService;

@RestController
@RequestMapping("/api/intervencion-preventiva")
public class IntervencionPreventivaRestController {

	@Autowired
	private IntervencionPreventivaService servicio;
	
	@GetMapping
	public List<IntervencionPreventivaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<IntervencionPreventivaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public IntervencionPreventivaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public IntervencionPreventivaEntity add(@RequestBody IntervencionPreventivaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public IntervencionPreventivaEntity update(@RequestBody IntervencionPreventivaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping("{id}")
	public IntervencionPreventivaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public IntervencionPreventivaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
