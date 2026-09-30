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

@Entity(name = "EstadoTareaPreventivaEntity")
@Table(name = "estado_tarea_preventiva")
public class EstadoTareaPreventivaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(nullable = false, unique = true, length = 60)
    private String nombre;

    @Column(name = "es_estado_final", nullable = false)
    private Boolean esEstadoFinal;

    @Column(nullable = false)
    private Boolean activo;
}