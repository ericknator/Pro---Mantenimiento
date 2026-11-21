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

@Entity(name = "ActuacionAlertaInternaEntity")
@Table(name = "actuacion_alerta_interna")
public class ActuacionAlertaInternaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alerta_interna_id", nullable = false)
    private AlertaInternaEntity alerta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private UsuarioPerfilEntity actor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_anterior_id", nullable = false)
    private EstadoAlertaInternaEntity estadoAnterior;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_nuevo_id", nullable = false)
    private EstadoAlertaInternaEntity estadoNuevo;

    @Column(columnDefinition = "TEXT")
    private String observacion;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;
}
