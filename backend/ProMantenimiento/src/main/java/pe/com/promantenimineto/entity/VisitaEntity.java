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

@Entity(name = "VisitaEntity")
@Table(name = "visita")
public class VisitaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String codigo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unidad_id", nullable = false)
    private UnidadResidencialEntity unidad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autorizado_por_id", nullable = false)
    private UsuarioPerfilEntity autorizadoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_visita_id", nullable = false)
    private TipoVisitaEntity tipoVisita;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estado_visita_id", nullable = false)
    private EstadoVisitaEntity estadoVisita;

    @Column(name = "nombre_visitante", nullable = false, length = 150)
    private String nombreVisitante;

    @Column(name = "documento_visitante", length = 30)
    private String documentoVisitante;

    @Column(length = 500)
    private String observacion;

    @Column(name = "vigente_desde", nullable = false)
    private LocalDateTime vigenteDesde;

    @Column(name = "vigente_hasta", nullable = false)
    private LocalDateTime vigenteHasta;

    @Column(name = "codigo_acceso", unique = true, length = 120)
    private String codigoAcceso;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;
}