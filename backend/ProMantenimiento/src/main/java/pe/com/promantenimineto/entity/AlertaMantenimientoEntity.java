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

@Entity(name = "AlertaMantenimientoEntity")
@Table(name = "alerta_mantenimiento")
public class AlertaMantenimientoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarea_preventiva_id", nullable = false)
    private TareaPreventivaEntity tareaPreventiva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_alerta_id", nullable = false)
    private TipoAlertaMantenimientoEntity tipoAlerta;

    @Column(nullable = false, length = 500)
    private String mensaje;

    @Column(name = "generada_en", nullable = false)
    private LocalDateTime generadaEn;

    @Column(nullable = false)
    private Boolean atendida;

    @Column(name = "atendida_en")
    private LocalDateTime atendidaEn;
}