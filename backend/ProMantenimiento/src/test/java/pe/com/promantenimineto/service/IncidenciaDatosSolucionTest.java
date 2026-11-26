package pe.com.promantenimineto.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import pe.com.promantenimineto.entity.*;
import pe.com.promantenimineto.repository.*;
import pe.com.promantenimineto.service.impl.IncidenciaServiceImpl;

@ExtendWith(MockitoExtension.class)
class IncidenciaDatosSolucionTest {
    @Mock IncidenciaRepository repositorio;
    @Mock ActuacionIncidenciaRepository actuacionRepositorio;
    @InjectMocks IncidenciaServiceImpl servicio;
    private IncidenciaEntity incidencia;
    private final LocalDateTime fecha = LocalDateTime.of(2026, 11, 26, 17, 0);

    @BeforeEach void preparar() {
        var residente = UsuarioPerfilEntity.builder().id(1L)
                .rol(RolEntity.builder().codigo("RESIDENTE").build()).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(residente, null, java.util.List.of()));
        incidencia = IncidenciaEntity.builder().id(15L).solicitante(residente).build();
        when(repositorio.findById(15L)).thenReturn(Optional.of(incidencia));
    }

    @AfterEach void limpiar() { SecurityContextHolder.clearContext(); }

    private ActuacionIncidenciaEntity actuacion(String texto, LocalDateTime momento) {
        return ActuacionIncidenciaEntity.builder().descripcion(texto).creadoEn(momento).build();
    }

    @Test void residenteConsultaDiagnosticoYAccionesPersistidosDeSuCaso() {
        when(actuacionRepositorio.findFirstByIncidenciaIdAndTipoAccionCodigoOrderByCreadoEnDesc(15L, "DIAGNOSTICO"))
                .thenReturn(Optional.of(actuacion("Diagnóstico sintético", fecha)));
        when(actuacionRepositorio.findFirstByIncidenciaIdAndTipoAccionCodigoOrderByCreadoEnDesc(15L, "ACCION_REALIZADA"))
                .thenReturn(Optional.of(actuacion("Acción sintética", fecha)));
        var respuesta = servicio.findById(15L);
        assertEquals("Diagnóstico sintético", respuesta.getDiagnosticoTecnico());
        assertEquals("Acción sintética", respuesta.getAccionesRealizadas());
        verify(repositorio, never()).save(any());
    }

    @Test void nuevaAtencionSinDiagnosticoNoReutilizaElAnterior() {
        when(actuacionRepositorio.findFirstByIncidenciaIdAndTipoAccionCodigoOrderByCreadoEnDesc(15L, "DIAGNOSTICO"))
                .thenReturn(Optional.of(actuacion("Diagnóstico anterior", fecha.minusDays(1))));
        when(actuacionRepositorio.findFirstByIncidenciaIdAndTipoAccionCodigoOrderByCreadoEnDesc(15L, "ACCION_REALIZADA"))
                .thenReturn(Optional.of(actuacion("Nueva acción", fecha)));
        var respuesta = servicio.findById(15L);
        assertNull(respuesta.getDiagnosticoTecnico());
        assertEquals("Nueva acción", respuesta.getAccionesRealizadas());
    }

    @Test void sinActuacionesDevuelveAusenciaSinInventarTexto() {
        var respuesta = servicio.findById(15L);
        assertNull(respuesta.getDiagnosticoTecnico());
        assertNull(respuesta.getAccionesRealizadas());
    }

    @Test void otroResidenteNoPuedeConsultarDatosTecnicosDelCaso() {
        incidencia.setSolicitante(UsuarioPerfilEntity.builder().id(2L).build());
        assertThrows(ResponseStatusException.class, () -> servicio.findById(15L));
        verifyNoInteractions(actuacionRepositorio);
    }
}
