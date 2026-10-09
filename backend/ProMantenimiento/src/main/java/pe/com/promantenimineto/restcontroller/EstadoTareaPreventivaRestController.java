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

import pe.com.promantenimineto.entity.EstadoTareaPreventivaEntity;
import pe.com.promantenimineto.service.EstadoTareaPreventivaService;

@RestController
@RequestMapping("/api/estado-tarea-preventiva")
public class EstadoTareaPreventivaRestController {

	@Autowired
	private EstadoTareaPreventivaService servicio;
	
	@GetMapping
	public List<EstadoTareaPreventivaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<EstadoTareaPreventivaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public EstadoTareaPreventivaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public EstadoTareaPreventivaEntity add(@RequestBody EstadoTareaPreventivaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public EstadoTareaPreventivaEntity update(@RequestBody EstadoTareaPreventivaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public EstadoTareaPreventivaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public EstadoTareaPreventivaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
