package pe.com.promantenimineto.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import pe.com.promantenimineto.projection.HistorialActivoProjection;
import pe.com.promantenimineto.repository.HistorialActivoRepository;
import pe.com.promantenimineto.service.HistorialActivoService;

@Service
@RequiredArgsConstructor
public class HistorialActivoServiceImpl implements HistorialActivoService {

    private final HistorialActivoRepository historialActivoRepository;

    @Override
    public List<HistorialActivoProjection> listarHistorial() {

        return historialActivoRepository.listarHistorial();
    }
}
