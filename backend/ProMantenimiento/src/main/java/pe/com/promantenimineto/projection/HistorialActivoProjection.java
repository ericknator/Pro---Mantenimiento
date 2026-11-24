package pe.com.promantenimineto.projection;

import java.time.LocalDateTime;

public interface HistorialActivoProjection {

    String getTipo();

    Long getRegistroId();

    String getCodigo();

    String getCodigoActivo();

    String getActivoNombre();

    String getTitulo();

    String getDescripcion();

    String getCategoria();

    String getEstado();

    LocalDateTime getFecha();
}
