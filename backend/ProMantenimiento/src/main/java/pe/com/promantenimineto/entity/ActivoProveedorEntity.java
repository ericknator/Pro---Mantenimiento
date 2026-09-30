package pe.com.promantenimineto.entity;

import java.time.LocalDate;

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
@Table(name = "activo_proveedor")
@IdClass(ActivoProveedorId.class)
public class ActivoProveedorEntity {

    @Id
    @Column(name = "activo_id")
    private Long activoId;

    @Id
    @Column(name = "proveedor_id")
    private Long proveedorId;

    @Id
    @Column(name = "tipo_relacion", length = 40)
    private String tipoRelacion;

    @Column(nullable = false, length = 40)
    private String tipoRelacion;

    @Column
    private LocalDate desde;

    @Column
    private LocalDate hasta;

    @Column(nullable = false)
    private Boolean activo;
}