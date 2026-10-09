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

import pe.com.promantenimineto.entity.EstadoIncidenciaEntity;
import pe.com.promantenimineto.service.EstadoIncidenciaService;

@RestController
@RequestMapping("/api/estado-incidencia")
public class EstadoIncidenciaRestController {

	@Autowired
	private EstadoIncidenciaService servicio;
	
	@GetMapping
	public List<EstadoIncidenciaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<EstadoIncidenciaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public EstadoIncidenciaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public EstadoIncidenciaEntity add(@RequestBody EstadoIncidenciaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public EstadoIncidenciaEntity update(@RequestBody EstadoIncidenciaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping("{id}")
	public EstadoIncidenciaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public EstadoIncidenciaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
