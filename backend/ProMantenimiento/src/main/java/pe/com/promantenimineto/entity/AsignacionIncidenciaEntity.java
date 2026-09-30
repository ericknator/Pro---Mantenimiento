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

@Entity(name = "AsignacionIncidenciaEntity")
@Table(name = "asignacion_incidencia")
public class AsignacionIncidenciaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incidencia_id", nullable = false)
    private IncidenciaEntity incidencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asignado_por_id", nullable = false)
    private UsuarioPerfilEntity asignadoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_usuario_id")
    private UsuarioPerfilEntity responsableUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id")
    private ProveedorEntity proveedor;

    @Column(length = 500)
    private String observacion;

    @Column(name = "asignado_en", nullable = false)
    private LocalDateTime asignadoEn;

    @Column(name = "finalizado_en")
    private LocalDateTime finalizadoEn;
}