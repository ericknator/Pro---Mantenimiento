package pe.com.promantenimineto.exception;

import org.springframework.http.HttpStatus;

public class AdminUsuarioValidationException extends AdminUsuarioException {

    public AdminUsuarioValidationException(String message) {
        super(HttpStatus.BAD_REQUEST, "DATOS_INVALIDOS", message);
    }
}
