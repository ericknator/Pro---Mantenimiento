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

import pe.com.promantenimineto.entity.MovimientoCuotaEntity;
import pe.com.promantenimineto.service.MovimientoCuotaService;

@RestController
@RequestMapping("/api/movimiento-cuota")
public class MovimientoCuotaRestController {

	@Autowired
	private MovimientoCuotaService servicio;
	
	@GetMapping
	public List<MovimientoCuotaEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<MovimientoCuotaEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public MovimientoCuotaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public MovimientoCuotaEntity add(@RequestBody MovimientoCuotaEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public MovimientoCuotaEntity update(@RequestBody MovimientoCuotaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public MovimientoCuotaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public MovimientoCuotaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
