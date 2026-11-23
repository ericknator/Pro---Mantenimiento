package pe.com.promantenimineto.service;

import java.util.List;

import pe.com.promantenimineto.projection.HistorialActivoProjection;

public interface HistorialActivoService {

    List<HistorialActivoProjection> listarHistorial();
}
