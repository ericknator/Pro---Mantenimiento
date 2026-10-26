package pe.com.promantenimineto.entity;

import java.time.LocalDate;
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

@Entity(name = "PlanMantenimientoEntity")
@Table(name = "plan_mantenimiento")
public class PlanMantenimientoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activo_id", nullable = false)
    private ActivoEntity activo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "frecuencia_id", nullable = false)
    private FrecuenciaMantenimientoEntity frecuencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_plan_id", nullable = false)
    private EstadoPlanMantenimientoEntity estadoPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id")
    private UsuarioPerfilEntity responsable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id")
    private ProveedorEntity proveedor;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "proxima_fecha", nullable = false)
    private LocalDate proximaFecha;

    @Column(name = "dias_alerta", nullable = false)
    private Integer diasAlerta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creado_por_id", nullable = false)
    private UsuarioPerfilEntity creadoPor;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;
    
    @Transient
    private LocalDateTime primeraTareaProgramadaPara;
}