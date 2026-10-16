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

import pe.com.promantenimineto.entity.TipoActivoEntity;
import pe.com.promantenimineto.service.TipoActivoService;

@RestController
@RequestMapping("/api/tipo-activo")
public class TipoActivoRestController {

	@Autowired
	private TipoActivoService servicio;
	
	@GetMapping
	public List<TipoActivoEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<TipoActivoEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public TipoActivoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public TipoActivoEntity add(@RequestBody TipoActivoEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("/{id}")
	public TipoActivoEntity update(@RequestBody TipoActivoEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping("/{id}")
	public TipoActivoEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("/{id}")
	public TipoActivoEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
