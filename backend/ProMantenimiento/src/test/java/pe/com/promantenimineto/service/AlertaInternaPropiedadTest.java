package pe.com.promantenimineto.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import pe.com.promantenimineto.entity.AlertaInternaEntity;
import pe.com.promantenimineto.entity.RolEntity;
import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.repository.AlertaInternaRepository;
import pe.com.promantenimineto.repository.ActuacionAlertaInternaRepository;
import pe.com.promantenimineto.restcontroller.AlertaInternaRestController;
import pe.com.promantenimineto.service.impl.AlertaInternaServiceImpl;

// Dos perfiles sintéticos autenticados en memoria; HTTP simulado, sin Firebase/MySQL reales.
@ExtendWith(MockitoExtension.class)
class AlertaInternaPropiedadTest {
    @Mock private AlertaInternaRepository repositorio;
    @Mock private ActuacionAlertaInternaRepository actuaciones;
    @InjectMocks private AlertaInternaServiceImpl service;
    private MockMvc mvc;
    private UsuarioPerfilEntity propietario;
    private AlertaInternaEntity alerta;

    @BeforeEach void preparar() {
        propietario = residente(11L);
        alerta = AlertaInternaEntity.builder().id(77L).residente(propietario).ubicacion("Torre QA").build();
        var controller = new AlertaInternaRestController();
        ReflectionTestUtils.setField(controller, "servicio", service);
        mvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @AfterEach void limpiar() { SecurityContextHolder.clearContext(); }

    @Test void propietarioConsultaSuAlertaPorIdentificador() throws Exception {
        autenticar(propietario);
        when(repositorio.findById(77L)).thenReturn(Optional.of(alerta));
        when(actuaciones.findUltimasObservaciones(eq(77L), any())).thenReturn(List.of());
        mvc.perform(get("/api/alerta-interna/77")).andExpect(status().isOk());
    }

    @Test void otroResidenteRecibe403SinDatosDeLaAlertaAjena() throws Exception {
        autenticar(residente(22L));
        when(repositorio.findById(77L)).thenReturn(Optional.of(alerta));
        mvc.perform(get("/api/alerta-interna/77"))
            .andExpect(status().isForbidden()).andExpect(content().string(""));
    }

    @Test void listadoDelSegundoResidenteNoIncluyeAlertasDelPrimero() throws Exception {
        autenticar(residente(22L));
        when(repositorio.findByResidenteIdOrderByFechaEmisionDesc(22L)).thenReturn(List.of());
        mvc.perform(get("/api/alerta-interna/mis-alertas"))
            .andExpect(status().isOk()).andExpect(content().json("[]"));
    }

    private UsuarioPerfilEntity residente(Long id) {
        return UsuarioPerfilEntity.builder().id(id).nombres("Residente QA").activo(true)
            .rol(RolEntity.builder().id(2L).codigo("RESIDENTE").activo(true).build()).build();
    }
    private void autenticar(UsuarioPerfilEntity perfil) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
            perfil, null, List.of(new SimpleGrantedAuthority("ROLE_RESIDENTE"))));
    }
}
