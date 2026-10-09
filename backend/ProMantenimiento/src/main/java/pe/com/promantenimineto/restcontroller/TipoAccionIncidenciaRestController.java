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

import pe.com.promantenimineto.entity.TipoAccionIncidenciaEntity;
import pe.com.promantenimineto.service.TipoAccionIncidenciaService;

@RestController
@RequestMapping("/api/tipo-accion-incidencia")
public class TipoAccionIncidenciaRestController {

	@Autowired
	private TipoAccionIncidenciaService servicio;
	
	@GetMapping
	public List<TipoAccionIncidenciaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<TipoAccionIncidenciaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public TipoAccionIncidenciaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public TipoAccionIncidenciaEntity add(@RequestBody TipoAccionIncidenciaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public TipoAccionIncidenciaEntity update(@RequestBody TipoAccionIncidenciaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping("{id}")
	public TipoAccionIncidenciaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public TipoAccionIncidenciaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
