
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

@Entity(name = "AlertaInternaEntity")
@Table(name = "alerta_interna")
public class AlertaInternaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residente_id", nullable = false)
    private UsuarioPerfilEntity residente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_alerta_id", nullable = false)
    private TipoAlertaInternaEntity tipoAlerta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_id", nullable = false)
    private EstadoAlertaInternaEntity estado;

    @Column(nullable = false, length = 255)
    private String ubicacion;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;
}
