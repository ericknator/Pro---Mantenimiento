package pe.com.promantenimineto.entity;

import java.io.Serializable;
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
@Table(name = "usuario_unidad")
@IdClass(UsuarioUnidadId.class)
public class UsuarioUnidadEntity {

    @Id
    @Column(name = "usuario_id")
    private Long usuarioId;

    @Id
    @Column(name = "unidad_id")
    private Long unidadId;

    @Column(nullable = false, length = 30)
    private String relacion;

    @Column(name = "es_principal", nullable = false)
    private Boolean esPrincipal;

    @Column(nullable = false)
    private Boolean activo;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;
}