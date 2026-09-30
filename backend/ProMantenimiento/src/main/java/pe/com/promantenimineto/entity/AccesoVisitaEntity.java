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

@Entity(name = "AccesoVisitaEntity")
@Table(name = "acceso_visita")
public class AccesoVisitaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visita_id", nullable = false)
    private VisitaEntity visita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ingreso_registrado_por_id", nullable = false)
    private UsuarioPerfilEntity ingresoRegistradoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salida_registrada_por_id")
    private UsuarioPerfilEntity salidaRegistradaPor;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDateTime fechaIngreso;

    @Column(name = "fecha_salida")
    private LocalDateTime fechaSalida;

    @Column(name = "observacion_ingreso", length = 300)
    private String observacionIngreso;

    @Column(name = "observacion_salida", length = 300)
    private String observacionSalida;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;
}