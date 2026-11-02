package pe.com.promantenimineto.restcontroller;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pe.com.promantenimineto.entity.IncidenciaEntity;
import pe.com.promantenimineto.service.IncidenciaService;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.core.JacksonException;

@RestController
@RequestMapping("/api/incidencia")
public class IncidenciaRestController {

	@Autowired
	private IncidenciaService servicio;

	@GetMapping
	public List<IncidenciaEntity> findAll() {
		return servicio.findAll();
	}

	@GetMapping("/custom")
	public List<IncidenciaEntity> findAllCustom() {
		return servicio.findAllCustom();
	}

	@GetMapping("/{id}")
	public IncidenciaEntity findById(@PathVariable Long id) {
		return servicio.findById(id);
	}

	@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
	public IncidenciaEntity add(@RequestBody IncidenciaEntity obj) {
	    return servicio.add(obj);
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public IncidenciaEntity addWithEvidencias(
	        @RequestPart("incidencia") String jsonIncidencia,
	        @RequestPart(value = "archivos", required = false)
	        List<MultipartFile> archivos
	) throws JacksonException {

	    IncidenciaEntity obj = new ObjectMapper()
	            .readValue(jsonIncidencia, IncidenciaEntity.class);

	    return servicio.addWithEvidencias(obj, archivos);
	}
	

	@PutMapping("{id}")
	public IncidenciaEntity update(@RequestBody IncidenciaEntity obj, @PathVariable Long id) {
		return servicio.update(obj, id);
	}

	@DeleteMapping("{id}")
	public IncidenciaEntity delete(@PathVariable Long id) {
		return servicio.delete(id);
	}

	@PatchMapping("{id}")
	public IncidenciaEntity enable(@PathVariable Long id) {
		return servicio.enable(id);
	}
	
	@PutMapping("/{id}/clasificacion")
	public IncidenciaEntity clasificar(
	        @RequestBody IncidenciaEntity obj,
	        @PathVariable Long id) {

	    return servicio.clasificar(obj, id);
	}
	

	@GetMapping("/asignadas")
	public List<IncidenciaEntity> findIncidenciasAsignadas() {
	    return servicio.findIncidenciasAsignadas();
	}
	
	

	@PatchMapping("/{id}/aceptar")
	public IncidenciaEntity aceptar(@PathVariable Long id) {
	    return servicio.aceptar(id);
	}
	
	@PatchMapping( value = "/{id}/finalizar-atencion", consumes = MediaType.MULTIPART_FORM_DATA_VALUE )
	public IncidenciaEntity finalizarAtencion(
	        @PathVariable Long id,
	        @RequestParam(value = "diagnosticoTecnico", required = false) String diagnosticoTecnico,
	        @RequestParam(value = "accionesRealizadas", required = false) String accionesRealizadas,
	        @RequestParam(value = "archivos", required = false) List<MultipartFile> archivos) {

	    return servicio.finalizarAtencion(
	        id,
	        diagnosticoTecnico,
	        accionesRealizadas,
	        archivos
	    );
	}

	
}
