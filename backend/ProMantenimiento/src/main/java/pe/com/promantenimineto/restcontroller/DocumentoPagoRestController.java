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

import pe.com.promantenimineto.entity.DocumentoPagoEntity;
import pe.com.promantenimineto.service.DocumentoPagoService;

@RestController
@RequestMapping("/api/documento-pago")
public class DocumentoPagoRestController {

	@Autowired
	private DocumentoPagoService servicio;
	
	@GetMapping
	public List<DocumentoPagoEntity> findAll(){
		return servicio.findAll();
	}
	
	@GetMapping("/custom")
	public List<DocumentoPagoEntity> findAllCustom(){
		return servicio.findAllCustom();
	}
	
	@GetMapping("/{id}")
	public DocumentoPagoEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}
	
	@PostMapping
	public DocumentoPagoEntity add(@RequestBody DocumentoPagoEntity obj) {
		return servicio.add(obj);
	}
	
	@PutMapping("{id}")
	public DocumentoPagoEntity update(@RequestBody DocumentoPagoEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}
	
	@DeleteMapping("{id}")
	public DocumentoPagoEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}
	
	@PatchMapping("{id}")
	public DocumentoPagoEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
}
