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

@Entity(name = "EvidenciaMantenimientoEntity")
@Table(name = "evidencia_mantenimiento")
public class EvidenciaMantenimientoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intervencion_preventiva_id", nullable = false)
    private IntervencionPreventivaEntity intervencionPreventiva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "autor_id", nullable = false)
    private UsuarioPerfilEntity autor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tipo_evidencia_id", nullable = false)
    private TipoEvidenciaEntity tipoEvidencia;

    @Column(name = "nombre_archivo", length = 255)
    private String nombreArchivo;

    @Column(name = "url_recurso", nullable = false, length = 1000)
    private String urlRecurso;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "creado_en", nullable = false, insertable = false, updatable = false)
    private LocalDateTime creadoEn;
}