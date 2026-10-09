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

import pe.com.promantenimineto.entity.ComunicadoEntity;
import pe.com.promantenimineto.service.ComunicadoService;

@RestController
@RequestMapping("/api/comunicado")
public class ComunicadoRestController {

	@Autowired
	private ComunicadoService servicio;
	
	@GetMapping
	public List<ComunicadoEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<ComunicadoEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public ComunicadoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public ComunicadoEntity add(@RequestBody ComunicadoEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public ComunicadoEntity update(@RequestBody ComunicadoEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public ComunicadoEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public ComunicadoEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
