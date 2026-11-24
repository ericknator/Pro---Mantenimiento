package pe.com.promantenimineto.exception;

import org.springframework.http.HttpStatus;

public class AdminUsuarioFirebaseException extends AdminUsuarioException {

    public AdminUsuarioFirebaseException(String message, Throwable cause) {
        super(HttpStatus.BAD_GATEWAY, "FIREBASE_NO_DISPONIBLE", message);
        initCause(cause);
    }
}
