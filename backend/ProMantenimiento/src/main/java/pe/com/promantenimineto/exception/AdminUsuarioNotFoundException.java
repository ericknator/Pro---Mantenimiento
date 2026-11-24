package pe.com.promantenimineto.exception;

import org.springframework.http.HttpStatus;

public class AdminUsuarioNotFoundException extends AdminUsuarioException {

    public AdminUsuarioNotFoundException(String codigo, String message) {
        super(HttpStatus.NOT_FOUND, codigo, message);
    }
}
