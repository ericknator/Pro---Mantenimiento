
package pe.com.promantenimineto.service;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.repository.UsuarioPerfilRepository;

@Service
public class AuthService {

    private final UsuarioPerfilRepository usuarioPerfilRepository;

    public AuthService(UsuarioPerfilRepository usuarioPerfilRepository) {
        this.usuarioPerfilRepository = usuarioPerfilRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obtenerPerfil(String token) {

        try {
            // 1. Firebase verifica que el token sea válido.
            FirebaseToken tokenVerificado =
                    FirebaseAuth.getInstance().verifyIdToken(token);

            String uid = tokenVerificado.getUid();

            // 2. Buscar el perfil en MySQL.
            UsuarioPerfilEntity usuario = usuarioPerfilRepository
                    .findByFirebaseUid(uid)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "El usuario no tiene un perfil registrado en el sistema."
                            )
                    );

            // 3. Verificar que esté activo.
            if (!Boolean.TRUE.equals(usuario.getActivo())) {
                throw new RuntimeException("El usuario está inactivo.");
            }

            // 4. Obtener el rol registrado en la base de datos.
            String rol = usuario.getRol().getCodigo();

            // 5. Devolver el perfil sin exponer la entidad JPA.
            return Map.of(
                    "id", usuario.getId(),
                    "uid", uid,
                    "nombres", usuario.getNombres(),
                    "apellidos", usuario.getApellidos(),
                    "correo", usuario.getCorreo(),
                    "rol", rol
            );

        } catch (com.google.firebase.auth.FirebaseAuthException e) {
            System.err.println("ERROR FIREBASE: " + e.getErrorCode());
            System.err.println("DETALLE: " + e.getMessage());

            throw new RuntimeException("El token de Firebase no es válido.", e);
        }
    }
}
