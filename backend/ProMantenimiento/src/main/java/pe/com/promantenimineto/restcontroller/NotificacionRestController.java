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

import pe.com.promantenimineto.entity.NotificacionEntity;
import pe.com.promantenimineto.service.NotificacionService;

@RestController
@RequestMapping("/api/notificacion")
public class NotificacionRestController {

	@Autowired
	private NotificacionService servicio;
	
	@GetMapping
	public List<NotificacionEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<NotificacionEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public NotificacionEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public NotificacionEntity add(@RequestBody NotificacionEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public NotificacionEntity update(@RequestBody NotificacionEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping
	public NotificacionEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public NotificacionEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
