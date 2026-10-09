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

import pe.com.promantenimineto.entity.EvidenciaIncidenciaEntity;
import pe.com.promantenimineto.service.EvidenciaIncidenciaService;

@RestController
@RequestMapping("/api/evidencia-incidencia")
public class EvidenciaIncidenciaRestController {

	@Autowired
	private EvidenciaIncidenciaService servicio;
	
	@GetMapping
	public List<EvidenciaIncidenciaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<EvidenciaIncidenciaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public EvidenciaIncidenciaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public EvidenciaIncidenciaEntity add(@RequestBody EvidenciaIncidenciaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public EvidenciaIncidenciaEntity update(@RequestBody EvidenciaIncidenciaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public EvidenciaIncidenciaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public EvidenciaIncidenciaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
