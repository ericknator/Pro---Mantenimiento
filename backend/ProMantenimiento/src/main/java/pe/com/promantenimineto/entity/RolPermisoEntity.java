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

@Entity
@Table(name = "rol_permiso")
@IdClass(RolPermisoId.class)
public class RolPermisoEntity {

    @Id
    @Column(name = "rol_id")
    private Long rolId;

    @Id
    @Column(name = "permiso_id")
    private Long permisoId;
}