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

import pe.com.promantenimineto.entity.IncidenciaEntity;
import pe.com.promantenimineto.service.IncidenciaService;

@RestController
@RequestMapping("/api/incidencia")
public class IncidenciaRestController {

	@Autowired
	private IncidenciaService servicio;
	
	@GetMapping
	public List<IncidenciaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<IncidenciaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public IncidenciaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public IncidenciaEntity add(@RequestBody IncidenciaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public IncidenciaEntity update(@RequestBody IncidenciaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public IncidenciaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public IncidenciaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
