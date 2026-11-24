package pe.com.promantenimineto.exception;

import org.springframework.http.HttpStatus;

public class AdminUsuarioConflictException extends AdminUsuarioException {

    public AdminUsuarioConflictException(String message) {
        super(HttpStatus.CONFLICT, "USUARIO_DUPLICADO", message);
    }
}
