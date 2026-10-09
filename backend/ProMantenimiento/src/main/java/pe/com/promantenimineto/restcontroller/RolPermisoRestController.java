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

import pe.com.promantenimineto.entity.RolPermisoEntity;
import pe.com.promantenimineto.service.RolPermisoService;

@RestController
@RequestMapping("/api/rol-permiso")
public class RolPermisoRestController {
	
	@Autowired
	private RolPermisoService servicio;
	
	@GetMapping
	public List<RolPermisoEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<RolPermisoEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public RolPermisoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public RolPermisoEntity add(@RequestBody RolPermisoEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public RolPermisoEntity update(@RequestBody RolPermisoEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public RolPermisoEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public RolPermisoEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}

}
