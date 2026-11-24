package pe.com.promantenimineto.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.UserRecord;

import pe.com.promantenimineto.entity.RolEntity;
import pe.com.promantenimineto.entity.TorreEntity;
import pe.com.promantenimineto.entity.UnidadResidencialEntity;
import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.exception.AdminUsuarioValidationException;
import pe.com.promantenimineto.repository.AuditoriaSistemaRepository;
import pe.com.promantenimineto.repository.RolRepository;
import pe.com.promantenimineto.repository.UnidadResidencialRepository;
import pe.com.promantenimineto.repository.UsuarioPerfilRepository;
import pe.com.promantenimineto.repository.UsuarioUnidadRepository;

@ExtendWith(MockitoExtension.class)
class AdminUsuarioServiceTest {

    @Mock
    private FirebaseAuth firebaseAuth;
    @Mock
    private UsuarioPerfilRepository usuarioRepository;
    @Mock
    private UsuarioUnidadRepository usuarioUnidadRepository;
    @Mock
    private UnidadResidencialRepository unidadRepository;
    @Mock
    private RolRepository rolRepository;
    @Mock
    private AuditoriaSistemaRepository auditoriaRepository;

    @Mock
    private PlatformTransactionManager transactionManager;

    private AdminUsuarioService service;
    private RolEntity rolResidente;
    private UnidadResidencialEntity unidad;

    @BeforeEach
    void setUp() {
        service = new AdminUsuarioService(
                firebaseAuth,
                usuarioRepository,
                usuarioUnidadRepository,
                unidadRepository,
                rolRepository,
                auditoriaRepository, transactionManager);
        lenient().when(transactionManager.getTransaction(any())).thenReturn(new SimpleTransactionStatus());

        rolResidente = RolEntity.builder()
                .id(2L)
                .codigo("RESIDENTE")
                .nombre("Residente")
                .activo(true)
                .build();
        unidad = UnidadResidencialEntity.builder()
                .id(11L)
                .torre(TorreEntity.builder().id(1L).codigo("T01").nombre("Torre 1").build())
                .piso(1)
                .numero("101")
                .activo(true)
                .creadoEn(LocalDateTime.now())
                .build();
    }

    @Test
    void registraFirebasePerfilRelacionYAuditoria() throws Exception {
        UserRecord firebaseUser = org.mockito.Mockito.mock(UserRecord.class);
        when(firebaseUser.getUid()).thenReturn("uid-pms276-1");
        when(firebaseAuth.createUser(any(UserRecord.CreateRequest.class))).thenReturn(firebaseUser);
        when(usuarioRepository.existsByCorreoIgnoreCase(anyString())).thenReturn(false);
        when(rolRepository.findByCodigoAndActivoTrue("RESIDENTE")).thenReturn(Optional.of(rolResidente));
        when(unidadRepository.findById(11L)).thenReturn(Optional.of(unidad));
        when(usuarioRepository.getReferenceById(99L)).thenReturn(UsuarioPerfilEntity.builder().id(99L).build());
        when(usuarioRepository.save(any(UsuarioPerfilEntity.class))).thenAnswer(invocation -> {
            UsuarioPerfilEntity perfil = invocation.getArgument(0);
            perfil.setId(100L);
            return perfil;
        });

        AdminUsuarioService.UsuarioView resultado = service.registrar(
                new AdminUsuarioService.CrearUsuarioCommand(
                        " Ana  María ",
                        " Pérez ",
                        " ANA@EXAMPLE.COM ",
                        " 999-111-222 ",
                        "Temporal-123",
                        11L,
                        "propietario"),
                99L);

        assertEquals("ana@example.com", resultado.correo());
        assertEquals("Ana María", resultado.nombres());
        assertEquals("T01 - Dpto. 101 (piso 1)", resultado.unidades().get(0).etiqueta());
        assertEquals("PROPIETARIO", resultado.unidades().get(0).relacion());
        verify(firebaseAuth).createUser(any(UserRecord.CreateRequest.class));
        verify(usuarioRepository).save(any(UsuarioPerfilEntity.class));
        verify(usuarioUnidadRepository).save(any());
        verify(auditoriaRepository).save(any());
    }

    @Test
    void rechazaRelacionNoPermitidaAntesDeContactarFirebase() throws Exception {
        assertThrows(AdminUsuarioValidationException.class, () -> service.registrar(
                new AdminUsuarioService.CrearUsuarioCommand(
                        "Ana", "Pérez", "ana@example.com", null,
                        "Temporal-123", 11L, "VISITANTE"),
                99L));

        verify(firebaseAuth, never()).createUser(any(UserRecord.CreateRequest.class));
    }

    @Test
    void compensaFirebaseSiFallaLaPersistenciaMysql() throws Exception {
        UserRecord firebaseUser = org.mockito.Mockito.mock(UserRecord.class);
        when(firebaseUser.getUid()).thenReturn("uid-pms276-rollback");
        when(firebaseAuth.createUser(any(UserRecord.CreateRequest.class))).thenReturn(firebaseUser);
        when(usuarioRepository.existsByCorreoIgnoreCase(anyString())).thenReturn(false);
        when(rolRepository.findByCodigoAndActivoTrue("RESIDENTE")).thenReturn(Optional.of(rolResidente));
        when(unidadRepository.findById(11L)).thenReturn(Optional.of(unidad));
        when(usuarioRepository.save(any(UsuarioPerfilEntity.class))).thenAnswer(invocation -> {
            UsuarioPerfilEntity perfil = invocation.getArgument(0);
            perfil.setId(100L);
            return perfil;
        });
        when(usuarioUnidadRepository.save(any())).thenThrow(new RuntimeException("fallo de MySQL"));

        assertThrows(RuntimeException.class, () -> service.registrar(
                new AdminUsuarioService.CrearUsuarioCommand(
                        "Ana", "Pérez", "ana@example.com", null,
                        "Temporal-123", 11L, "INQUILINO"),
                null));

        verify(firebaseAuth).deleteUser("uid-pms276-rollback");
    }
    @Test
    void compensaFirebaseSiFallaElCommitDespuesDeGuardar() throws Exception {
        prepararAlta("uid-commit-fallido");
        doThrow(new RuntimeException("commit fallido")).when(transactionManager).commit(any());
        assertThrows(RuntimeException.class, () -> service.registrar(comandoValido(), null));
        var orden = inOrder(usuarioUnidadRepository, transactionManager, firebaseAuth);
        orden.verify(usuarioUnidadRepository).save(any());
        orden.verify(transactionManager).commit(any());
        orden.verify(firebaseAuth).deleteUser("uid-commit-fallido");
    }

    @Test
    void conservaFalloOriginalYRecuperacionPendienteSiFirebaseNoElimina() throws Exception {
        prepararAlta("uid-recuperar");
        RuntimeException falloMysql = new RuntimeException("commit fallido");
        doThrow(falloMysql).when(transactionManager).commit(any());
        var falloFirebase = org.mockito.Mockito.mock(com.google.firebase.auth.FirebaseAuthException.class);
        doThrow(falloFirebase).when(firebaseAuth).deleteUser("uid-recuperar");
        RuntimeException resultado = assertThrows(RuntimeException.class,
                () -> service.registrar(comandoValido(), null));
        assertEquals(falloMysql, resultado);
        assertEquals(1, resultado.getSuppressed().length);
        verify(firebaseAuth).deleteUser("uid-recuperar");
    }

    private AdminUsuarioService.CrearUsuarioCommand comandoValido() {
        return new AdminUsuarioService.CrearUsuarioCommand(
                "Ana", "Pérez", "ana@example.com", null, "Temporal-123", 11L, "INQUILINO");
    }

    private void prepararAlta(String uid) throws Exception {
        UserRecord firebaseUser = org.mockito.Mockito.mock(UserRecord.class);
        when(firebaseUser.getUid()).thenReturn(uid);
        when(firebaseAuth.createUser(any(UserRecord.CreateRequest.class))).thenReturn(firebaseUser);
        when(rolRepository.findByCodigoAndActivoTrue("RESIDENTE")).thenReturn(Optional.of(rolResidente));
        when(unidadRepository.findById(11L)).thenReturn(Optional.of(unidad));
        when(usuarioRepository.save(any(UsuarioPerfilEntity.class))).thenAnswer(invocation -> {
            UsuarioPerfilEntity perfil = invocation.getArgument(0);
            perfil.setId(100L);
            return perfil;
        });
    }

}
