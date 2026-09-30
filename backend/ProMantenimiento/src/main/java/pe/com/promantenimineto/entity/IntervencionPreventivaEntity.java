package pe.com.promantenimineto.entity;

import java.math.BigDecimal;
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

@Entity(name = "IntervencionPreventivaEntity")
@Table(name = "intervencion_preventiva")
public class IntervencionPreventivaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarea_preventiva_id", nullable = false)
    private TareaPreventivaEntity tareaPreventiva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ejecutor_usuario_id")
    private UsuarioPerfilEntity ejecutorUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id")
    private ProveedorEntity proveedor;

    @Column(name = "acciones_realizadas", nullable = false, columnDefinition = "TEXT")
    private String accionesRealizadas;

    @Column(columnDefinition = "TEXT")
    private String observaciones;

    @Column(precision = 12, scale = 2)
    private BigDecimal costo;

    @Column(name = "ejecutado_en", nullable = false)
    private LocalDateTime ejecutadoEn;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;
}