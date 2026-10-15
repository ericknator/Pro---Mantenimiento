package pe.com.promantenimineto.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@Entity(name = "ActuacionIncidenciaEntity")
@Table(name = "actuacion_incidencia")
public class ActuacionIncidenciaEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "incidencia_id", nullable = false)
	private IncidenciaEntity incidencia;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "actor_id", nullable = false)
	private UsuarioPerfilEntity actor;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "tipo_accion_id", nullable = false)
	private TipoAccionIncidenciaEntity tipoAccion;
	
	@Column(nullable = false, columnDefinition = "TEXT")
	private String descripcion;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "estado_anterior_id")
	private EstadoIncidenciaEntity estadoAnterior;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "estado_nuevo_id")
	private EstadoIncidenciaEntity estadoNuevo;
	
	@Column(name = "creado_en", nullable = false)
	private LocalDateTime creadoEn;

}