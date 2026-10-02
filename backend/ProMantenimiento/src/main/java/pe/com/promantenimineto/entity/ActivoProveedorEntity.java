package pe.com.promantenimineto.entity;

import java.time.LocalDate;

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

@Entity(name = "ActivoProveedorEntity")
@Table(
    name = "activo_proveedor",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_activo_proveedor",
            columnNames = {"activo_id", "proveedor_id", "tipo_relacion"}
        )
    }
)
public class ActivoProveedorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activo_id", nullable = false)
    private ActivoEntity activoEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id", nullable = false)
    private ProveedorEntity proveedor;

    @Column(name = "tipo_relacion", nullable = false, length = 40)
    private String tipoRelacion;

    @Column(name = "desde")
    private LocalDate desde;

    @Column(name = "hasta")
    private LocalDate hasta;

    @Column(nullable = false)
    private Boolean activo;

}