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

import pe.com.promantenimineto.entity.AuditoriaSistemaEntity;
import pe.com.promantenimineto.service.AuditoriaSistemaService;

@RestController
@RequestMapping("/api/auditoria-sistema")
public class AuditoriaSistemaRestController {

	@Autowired
	private AuditoriaSistemaService servicio;
	
	@GetMapping
	public List<AuditoriaSistemaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<AuditoriaSistemaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public AuditoriaSistemaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public AuditoriaSistemaEntity add(@RequestBody AuditoriaSistemaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public AuditoriaSistemaEntity update(@RequestBody AuditoriaSistemaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping("{id}")
	public AuditoriaSistemaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public AuditoriaSistemaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
