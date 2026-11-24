package pe.com.promantenimineto.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.web.server.ResponseStatusException;
import pe.com.promantenimineto.entity.*;
import pe.com.promantenimineto.repository.*;
import pe.com.promantenimineto.restcontroller.IncidenciaActivoRestController;
import tools.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class IncidenciaActivoServiceTest {
    @Mock IncidenciaRepository incidencias;
    @Mock ActivoRepository activos;
    @Mock AuditoriaSistemaRepository auditoria;
    @InjectMocks IncidenciaActivoService service;
    IncidenciaEntity incidencia;
    ActivoEntity equipo;
    UsuarioPerfilEntity administrador;

    @BeforeEach void preparar() {
        administrador = usuario("ADMINISTRADOR", true);
        autenticar(administrador);
        incidencia = IncidenciaEntity.builder().id(7L).codigo("INC-QA")
                .estado(EstadoIncidenciaEntity.builder().codigo("REPORTADA").build()).build();
        equipo = ActivoEntity.builder().id(2L).codigo("ACT-QA-2")
                .nombre("Equipo sintético B").activo(true).build();
    }
    @AfterEach void limpiar() { SecurityContextHolder.clearContext(); }

    @Test void administradorAsociaPorIdSinCambiarEstadoYRegistraAuditoria() {
        when(incidencias.findById(7L)).thenReturn(Optional.of(incidencia));
        when(activos.findById(2L)).thenReturn(Optional.of(equipo));
        var respuesta = service.asociar(7L, 2L);
        assertEquals(2L, respuesta.activo().id());
        assertSame(equipo, incidencia.getActivo());
        assertEquals("REPORTADA", incidencia.getEstado().getCodigo());
        verify(incidencias).save(incidencia);
        var captura = ArgumentCaptor.forClass(AuditoriaSistemaEntity.class);
        verify(auditoria).save(captura.capture());
        assertEquals("activoAnteriorId=null;activoNuevoId=2", captura.getValue().getDetalle());
        assertSame(administrador, captura.getValue().getUsuario());
    }

    @Test void permiteCambiarEquipoSinAsociacionPorTexto() {
        incidencia.setActivo(ActivoEntity.builder().id(1L).nombre(equipo.getNombre()).build());
        when(incidencias.findById(7L)).thenReturn(Optional.of(incidencia));
        when(activos.findById(2L)).thenReturn(Optional.of(equipo));
        assertEquals(2L, service.asociar(7L, 2L).activo().id());
        assertEquals(2L, incidencia.getActivo().getId());
    }

    @Test void permiteRetirarRelacionDeUnaIncidenciaGeneral() {
        incidencia.setActivo(equipo);
        when(incidencias.findById(7L)).thenReturn(Optional.of(incidencia));
        assertNull(service.asociar(7L, null).activo());
        assertNull(incidencia.getActivo());
        verifyNoInteractions(activos);
        verify(auditoria).save(any());
    }

    @Test void repetirAsociacionNoGeneraOtraAuditoria() {
        incidencia.setActivo(equipo);
        when(incidencias.findById(7L)).thenReturn(Optional.of(incidencia));
        when(activos.findById(2L)).thenReturn(Optional.of(equipo));
        service.asociar(7L, 2L);
        verify(incidencias, never()).save(any());
        verifyNoInteractions(auditoria);
    }

    @Test void activoInexistenteNoModificaIncidenciaNiAuditoria() {
        when(incidencias.findById(7L)).thenReturn(Optional.of(incidencia));
        when(activos.findById(99L)).thenReturn(Optional.empty());
        assertEquals(HttpStatus.NOT_FOUND,
                assertThrows(ResponseStatusException.class, () -> service.asociar(7L, 99L)).getStatusCode());
        assertNull(incidencia.getActivo());
        verify(incidencias, never()).save(any());
        verifyNoInteractions(auditoria);
    }

    @Test void activoInactivoEsRechazadoAntesDeGuardar() {
        equipo.setActivo(false);
        when(incidencias.findById(7L)).thenReturn(Optional.of(incidencia));
        when(activos.findById(2L)).thenReturn(Optional.of(equipo));
        assertEquals(HttpStatus.NOT_FOUND,
                assertThrows(ResponseStatusException.class, () -> service.asociar(7L, 2L)).getStatusCode());
        verify(incidencias, never()).save(any());
        verifyNoInteractions(auditoria);
    }

    @Test void rolesDistintosDelAdministradorNoPuedenAsociar() {
        for (String rol : List.of("RESIDENTE", "MANTENIMIENTO", "PORTERIA_SEGURIDAD")) {
            autenticar(usuario(rol, true));
            assertEquals(HttpStatus.FORBIDDEN,
                assertThrows(ResponseStatusException.class, () -> service.asociar(7L, 2L)).getStatusCode());
        }
        verifyNoInteractions(incidencias, activos, auditoria);
    }

    @Test void administradorInactivoNoPuedeAsociar() {
        autenticar(usuario("ADMINISTRADOR", false));
        assertEquals(HttpStatus.FORBIDDEN,
            assertThrows(ResponseStatusException.class, () -> service.asociar(7L, 2L)).getStatusCode());
        verifyNoInteractions(incidencias, activos, auditoria);
    }

    @Test void sinSesionEsRechazadoAntesDeConsultarDatos() {
        SecurityContextHolder.clearContext();
        assertEquals(HttpStatus.UNAUTHORIZED,
            assertThrows(ResponseStatusException.class, () -> service.asociar(7L, 2L)).getStatusCode());
        verifyNoInteractions(incidencias, activos, auditoria);
    }

    @Test void errorDeAuditoriaNoProduceRespuestaDeExito() {
        when(incidencias.findById(7L)).thenReturn(Optional.of(incidencia));
        when(activos.findById(2L)).thenReturn(Optional.of(equipo));
        when(auditoria.save(any())).thenThrow(new IllegalStateException("fallo sintético"));
        assertThrows(IllegalStateException.class, () -> service.asociar(7L, 2L));
    }

    @Test void jsonGeneralNoPermiteInyectarActivoPeroLoDevuelveEnLectura() {
        var mapper = new ObjectMapper();
        var recibido = mapper.readValue("{\"id\":7,\"activo\":{\"id\":2}}", IncidenciaEntity.class);
        assertNull(recibido.getActivo());
        incidencia.setActivo(equipo);
        assertEquals(2L, mapper.readTree(mapper.writeValueAsString(incidencia))
                .get("activo").get("id").asLong());
    }

    @Test void endpointDistingueCuerpoAusenteDeRetiradaExplicita() throws Exception {
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new IncidenciaActivoRestController(service)).build();
        mvc.perform(patch("/api/incidencia/7/activo").contentType("application/json").content("{}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(incidencias, activos, auditoria);
        incidencia.setActivo(equipo);
        when(incidencias.findById(7L)).thenReturn(Optional.of(incidencia));
        mvc.perform(patch("/api/incidencia/7/activo").contentType("application/json")
                .content("{\"activoId\":null}")).andExpect(status().isOk());
        assertNull(incidencia.getActivo());
    }

    private UsuarioPerfilEntity usuario(String rol, boolean activo) {
        return UsuarioPerfilEntity.builder().id(10L).activo(activo)
            .rol(RolEntity.builder().id(1L).codigo(rol).activo(true).build()).build();
    }
    private void autenticar(UsuarioPerfilEntity usuario) {
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(usuario, null, List.of()));
    }
}
