package pe.com.promantenimineto.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder

@Entity(name = "ProveedorContactoEntity")
@Table(name = "proveedor_contacto")
public class ProveedorContactoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id", nullable = false)
    private ProveedorEntity proveedor;

    @Column(nullable = false, length = 120)
    private String nombres;

    @Column(length = 80)
    private String cargo;

    @Column(length = 150)
    private String correo;

    @Column(length = 30)
    private String telefono;

    @Column(nullable = false)
    private Boolean principal;

    @Column(nullable = false)
    private Boolean activo;
}