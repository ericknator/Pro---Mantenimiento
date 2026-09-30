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

@Entity(name = "DocumentoPagoEntity")
@Table(name = "documento_pago")
public class DocumentoPagoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cuota_id", nullable = false)
    private CuotaUnidadEntity cuota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cargado_por_id", nullable = false)
    private UsuarioPerfilEntity cargadoPor;

    @Column(nullable = false, length = 40)
    private String tipo;

    @Column(name = "nombre_archivo", length = 255)
    private String nombreArchivo;

    @Column(name = "url_recurso", nullable = false, length = 1000)
    private String urlRecurso;

    @Column(name = "fecha_documento")
    private LocalDate fechaDocumento;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;
}