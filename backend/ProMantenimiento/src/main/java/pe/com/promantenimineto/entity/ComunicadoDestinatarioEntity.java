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

@Entity
@Table(name = "comunicado_destinatario")
@IdClass(ComunicadoDestinatarioId.class)
public class ComunicadoDestinatarioEntity {

    @Id
    @Column(name = "comunicado_id")
    private Long comunicadoId;

    @Id
    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(nullable = false)
    private Boolean leido;

    @Column(name = "leido_en")
    private LocalDateTime leidoEn;
}