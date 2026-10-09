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

import pe.com.promantenimineto.entity.ActuacionIncidenciaEntity;
import pe.com.promantenimineto.service.ActuacionIncidenciaService;

@RestController
@RequestMapping("/api/actuacion-incidencia")
public class ActuacionIncidenciaRestController {

	@Autowired
	private ActuacionIncidenciaService servicio;
	
	@GetMapping
	public List<ActuacionIncidenciaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<ActuacionIncidenciaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public ActuacionIncidenciaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public ActuacionIncidenciaEntity add(@RequestBody ActuacionIncidenciaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public ActuacionIncidenciaEntity update(@RequestBody ActuacionIncidenciaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public ActuacionIncidenciaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public ActuacionIncidenciaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
