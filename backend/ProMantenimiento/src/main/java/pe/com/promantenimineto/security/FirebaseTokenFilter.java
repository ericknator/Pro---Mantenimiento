package pe.com.promantenimineto.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import pe.com.promantenimineto.entity.UsuarioPerfilEntity;
import pe.com.promantenimineto.repository.UsuarioPerfilRepository;

@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    private final UsuarioPerfilRepository usuarioPerfilRepository;
    private final FirebaseAuth firebaseAuth;

    public FirebaseTokenFilter(
            UsuarioPerfilRepository usuarioPerfilRepository,
            FirebaseAuth firebaseAuth) {
        this.usuarioPerfilRepository = usuarioPerfilRepository;
        this.firebaseAuth = firebaseAuth;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authorization = request.getHeader("Authorization");

        // Sin token: dejamos que Spring Security rechace
        // la petición si el endpoint requiere autenticación.
        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = authorization.substring(7);

            FirebaseToken tokenVerificado = firebaseAuth.verifyIdToken(token);

            UsuarioPerfilEntity usuario =
                    usuarioPerfilRepository
                            .findByFirebaseUid(tokenVerificado.getUid())
                            .orElse(null);

            if (usuario == null ||
                    !Boolean.TRUE.equals(usuario.getActivo()) ||
                    usuario.getRol() == null ||
                    !Boolean.TRUE.equals(usuario.getRol().getActivo())) {
                response.sendError(
                        HttpServletResponse.SC_FORBIDDEN,
                        "Usuario sin perfil activo o sin rol activo.");
                return;
            }

            String codigoRol = usuario.getRol().getCodigo();

            var autoridades = List.of(
                    new SimpleGrantedAuthority("ROLE_" + codigoRol)
            );

            var autenticacion =
                    new UsernamePasswordAuthenticationToken(
                            usuario,
                            null,
                            autoridades
                    );

            SecurityContextHolder.getContext()
                    .setAuthentication(autenticacion);

            filterChain.doFilter(request, response);

        } catch (FirebaseAuthException e) {
            SecurityContextHolder.clearContext();
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "El token de Firebase no es válido o ha expirado.");
        } catch (RuntimeException e) {
            SecurityContextHolder.clearContext();
            response.sendError(
                    HttpServletResponse.SC_UNAUTHORIZED,
                    "No se pudo validar el token de Firebase.");
        }
    }
}
