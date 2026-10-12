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

@Entity(name = "UnidadResidencialEntity")
@Table(
    name = "unidad_residencial",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_unidad",
            columnNames = {"torre", "piso", "numero"}
        )
    }
)
public class UnidadResidencialEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "torre_id", nullable = false)
    private TorreEntity torre;

    @Column(nullable = false)
    private Integer piso;

    @Column(nullable = false, length = 20)
    private String numero;

    @Column(length = 120)
    private String referencia;

    @Column(nullable = false)
    private Boolean activo;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;
}