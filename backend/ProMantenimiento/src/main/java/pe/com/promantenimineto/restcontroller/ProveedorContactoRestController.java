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

import pe.com.promantenimineto.entity.ProveedorContactoEntity;
import pe.com.promantenimineto.service.ProveedorContactoService;

@RestController
@RequestMapping("/api/proveedor-contacto")
public class ProveedorContactoRestController {

	@Autowired
	private ProveedorContactoService servicio;
	
	@GetMapping
	public List<ProveedorContactoEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<ProveedorContactoEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public ProveedorContactoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public ProveedorContactoEntity add(@RequestBody ProveedorContactoEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public ProveedorContactoEntity update(@RequestBody ProveedorContactoEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public ProveedorContactoEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public ProveedorContactoEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
