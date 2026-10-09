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

import pe.com.promantenimineto.entity.TareaPreventivaEntity;
import pe.com.promantenimineto.service.TareaPreventivaService;

@RestController
@RequestMapping("/api/tarea-preventiva")
public class TareaPreventivaRestController {

	@Autowired
	private TareaPreventivaService servicio;
	
	@GetMapping
	public List<TareaPreventivaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<TareaPreventivaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public TareaPreventivaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public TareaPreventivaEntity add(@RequestBody TareaPreventivaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public TareaPreventivaEntity update(@RequestBody TareaPreventivaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping("{id}")
	public TareaPreventivaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public TareaPreventivaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
