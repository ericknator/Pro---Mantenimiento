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

import pe.com.promantenimineto.entity.TipoVisitaEntity;
import pe.com.promantenimineto.service.TipoVisitaService;

@RestController
@RequestMapping("/api/tipo-visita")
public class TipoVisitaRestController {
	@Autowired
	private TipoVisitaService servicio;
	
	@GetMapping
	public List<TipoVisitaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<TipoVisitaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public TipoVisitaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public TipoVisitaEntity add(@RequestBody TipoVisitaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public TipoVisitaEntity update(@RequestBody TipoVisitaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping("{id}")
	public TipoVisitaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public TipoVisitaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
