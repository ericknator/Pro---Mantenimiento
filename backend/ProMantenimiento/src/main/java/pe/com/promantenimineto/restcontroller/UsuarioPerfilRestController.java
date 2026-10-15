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

import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.service.UsuarioPerfilService;

@RestController
@RequestMapping("/api/usuario-perfil")
public class UsuarioPerfilRestController {
	
	@Autowired
	private UsuarioPerfilService servicio;
	
	@GetMapping
	public List<UsuarioPerfilEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<UsuarioPerfilEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public UsuarioPerfilEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public UsuarioPerfilEntity add(@RequestBody UsuarioPerfilEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public UsuarioPerfilEntity update(@RequestBody UsuarioPerfilEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping("{id}")
	public UsuarioPerfilEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public UsuarioPerfilEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
	
	@GetMapping("/responsables/rol/{rolId}")
	public List<UsuarioPerfilEntity> findResponsablesByRol(@PathVariable Long rolId) {
	    return servicio.findResponsablesByRol(rolId);
	}
}
