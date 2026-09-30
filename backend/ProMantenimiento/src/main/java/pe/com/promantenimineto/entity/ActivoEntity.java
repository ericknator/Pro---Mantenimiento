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

@Entity(name = "ActivoEntity")
@Table(name = "activo")
public class ActivoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_activo_id", nullable = false)
    private TipoActivoEntity tipoActivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_activo_id", nullable = false)
    private EstadoActivoEntity estadoActivo;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, length = 255)
    private String ubicacion;

    @Column(length = 80)
    private String marca;

    @Column(length = 80)
    private String modelo;

    @Column(name = "numero_serie", length = 100)
    private String numeroSerie;

    @Column(name = "fecha_instalacion")
    private LocalDate fechaInstalacion;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "es_critico", nullable = false)
    private Boolean esCritico;

    @Column(nullable = false)
    private Boolean activo;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;
}