package pe.com.promantenimineto.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder

@Entity(name = "ComunicadoDestinatarioEntity")
@Table(
    name = "comunicado_destinatario",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_comunicado_destinatario",
            columnNames = {"comunicado_id", "usuario_id"}
        )
    }
)
public class ComunicadoDestinatarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comunicado_id", nullable = false)
    private ComunicadoEntity comunicado;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioPerfilEntity usuario;

    @Column(nullable = false)
    private Boolean leido;

    @Column(name = "leido_en")
    private LocalDateTime leidoEn;

}