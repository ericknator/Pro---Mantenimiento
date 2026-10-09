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

import pe.com.promantenimineto.entity.PermisoEntity;
import pe.com.promantenimineto.service.PermisoService;


@RestController
@RequestMapping("/api/permiso")
public class PermisoRestController {
	
	@Autowired
	private PermisoService servicio;
	
	@GetMapping
	public List<PermisoEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<PermisoEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public PermisoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public PermisoEntity add(@RequestBody PermisoEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public PermisoEntity update(@RequestBody PermisoEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public PermisoEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public PermisoEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}

}
