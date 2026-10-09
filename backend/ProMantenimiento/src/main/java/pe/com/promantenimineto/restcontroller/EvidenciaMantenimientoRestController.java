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

import pe.com.promantenimineto.entity.EvidenciaMantenimientoEntity;
import pe.com.promantenimineto.service.EvidenciaMantenimientoService;

@RestController
@RequestMapping("/api/evidencia-mantenimiento")
public class EvidenciaMantenimientoRestController {

	@Autowired
	private EvidenciaMantenimientoService servicio;
	
	@GetMapping
	public List<EvidenciaMantenimientoEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<EvidenciaMantenimientoEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public EvidenciaMantenimientoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public EvidenciaMantenimientoEntity add(@RequestBody EvidenciaMantenimientoEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public EvidenciaMantenimientoEntity update(@RequestBody EvidenciaMantenimientoEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public EvidenciaMantenimientoEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public EvidenciaMantenimientoEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
