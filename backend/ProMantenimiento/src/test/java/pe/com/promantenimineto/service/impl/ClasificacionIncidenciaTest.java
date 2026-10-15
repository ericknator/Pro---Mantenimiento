package pe.com.promantenimineto.service.impl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;
import org.mockito.ArgumentCaptor;
import pe.com.promantenimineto.entity.*;
import pe.com.promantenimineto.repository.*;

class ClasificacionIncidenciaTest {
    private final IncidenciaServiceImpl service = new IncidenciaServiceImpl();
    private final IncidenciaRepository incidencias = mock(IncidenciaRepository.class);
    private final CategoriaIncidenciaRepository categorias = mock(CategoriaIncidenciaRepository.class);
    private final PrioridadIncidenciaRepository prioridades = mock(PrioridadIncidenciaRepository.class);
    private final ActuacionIncidenciaRepository actuaciones = mock(ActuacionIncidenciaRepository.class);
    private final TipoAccionIncidenciaRepository tipos = mock(TipoAccionIncidenciaRepository.class);
    private UsuarioPerfilEntity admin;
    private IncidenciaEntity original;
    private IncidenciaEntity solicitud;

    @BeforeEach void preparar() {
        ReflectionTestUtils.setField(service, "repositorio", incidencias);
        ReflectionTestUtils.setField(service, "categoriaRepositorio", categorias);
        ReflectionTestUtils.setField(service, "prioridadRepositorio", prioridades);
        ReflectionTestUtils.setField(service, "actuacionRepositorio", actuaciones);
        ReflectionTestUtils.setField(service, "tipoAccionRepositorio", tipos);
        RolEntity rol = new RolEntity();
        rol.setCodigo("ADMINISTRADOR");
        admin = new UsuarioPerfilEntity(); admin.setId(7L); admin.setRol(rol);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(admin, null, java.util.List.of()));
        CategoriaIncidenciaEntity categoria = new CategoriaIncidenciaEntity();
        categoria.setId(2L); categoria.setNombre("Sanitario"); categoria.setActivo(true);
        PrioridadIncidenciaEntity prioridad = new PrioridadIncidenciaEntity();
        prioridad.setId(3L); prioridad.setNombre("Alta"); prioridad.setActivo(true);
        EstadoIncidenciaEntity estado = new EstadoIncidenciaEntity(); estado.setCodigo("REPORTADA");
        original = new IncidenciaEntity(); original.setId(1L); original.setEstado(estado);
        solicitud = new IncidenciaEntity(); solicitud.setCategoria(categoria); solicitud.setPrioridad(prioridad);
        when(incidencias.findById(1L)).thenReturn(Optional.of(original));
        when(categorias.findById(2L)).thenReturn(Optional.of(categoria));
        when(prioridades.findById(3L)).thenReturn(Optional.of(prioridad));
        TipoAccionIncidenciaEntity tipo = new TipoAccionIncidenciaEntity(); tipo.setCodigo("CLASIFICACION"); tipo.setActivo(true);
        when(tipos.findByCodigo("CLASIFICACION")).thenReturn(Optional.of(tipo));
        when(incidencias.save(any())).thenAnswer(i -> i.getArgument(0));
    }

    @AfterEach void limpiar() { SecurityContextHolder.clearContext(); }

    @Test void guardaClasificacionConActorFechaYEstadoConservado() {
        var estado = original.getEstado();
        var resultado = service.clasificar(solicitud, 1L);
        assertEquals(2L, resultado.getCategoria().getId());
        assertEquals(3L, resultado.getPrioridad().getId());
        assertSame(estado, resultado.getEstado());
        var captor = ArgumentCaptor.forClass(ActuacionIncidenciaEntity.class);
        verify(actuaciones).save(captor.capture());
        var auditoria = captor.getValue();
        assertSame(admin, auditoria.getActor());
        assertEquals("CLASIFICACION", auditoria.getTipoAccion().getCodigo());
        assertEquals(resultado.getActualizadoEn(), auditoria.getCreadoEn());
        assertNotNull(auditoria.getCreadoEn());
    }

    @Test void rechazaCategoriaAusenteSinEscrituras() {
        solicitud.setCategoria(null);
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.clasificar(solicitud, 1L)).getStatusCode().value());
        verify(incidencias, never()).save(any()); verifyNoInteractions(actuaciones);
    }

    @Test void rechazaPrioridadAusenteSinEscrituras() {
        solicitud.setPrioridad(null);
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.clasificar(solicitud, 1L)).getStatusCode().value());
        verify(incidencias, never()).save(any()); verifyNoInteractions(actuaciones);
    }

    @Test void residenteNoPuedeClasificar() {
        admin.getRol().setCodigo("RESIDENTE");
        assertEquals(403, assertThrows(ResponseStatusException.class,
                () -> service.clasificar(solicitud, 1L)).getStatusCode().value());
        verifyNoInteractions(incidencias, actuaciones);
    }

    @Test void estadoDistintoDeReportadaNoSeModifica() {
        original.getEstado().setCodigo("ASIGNADA");
        assertEquals(409, assertThrows(ResponseStatusException.class,
                () -> service.clasificar(solicitud, 1L)).getStatusCode().value());
        verify(incidencias, never()).save(any()); verifyNoInteractions(actuaciones);
    }

    @Test void categoriaInactivaNoModificaNiRegistraActuacion() {
        solicitud.getCategoria().setActivo(false);
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.clasificar(solicitud, 1L)).getStatusCode().value());
        verify(incidencias, never()).save(any()); verifyNoInteractions(actuaciones);
    }

    @Test void prioridadInactivaNoModificaNiRegistraActuacion() {
        solicitud.getPrioridad().setActivo(false);
        assertEquals(400, assertThrows(ResponseStatusException.class,
                () -> service.clasificar(solicitud, 1L)).getStatusCode().value());
        verify(incidencias, never()).save(any()); verifyNoInteractions(actuaciones);
    }

    @Test void sinSesionNoPuedeClasificar() {
        SecurityContextHolder.clearContext();
        assertEquals(401, assertThrows(ResponseStatusException.class,
                () -> service.clasificar(solicitud, 1L)).getStatusCode().value());
        verifyNoInteractions(incidencias, actuaciones);
    }
}
