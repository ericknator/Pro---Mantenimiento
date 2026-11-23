package pe.com.promantenimineto.exception;

import org.springframework.http.HttpStatus;

public class AdminUsuarioException extends RuntimeException {

    private final HttpStatus status;
    private final String codigo;

    public AdminUsuarioException(HttpStatus status, String codigo, String message) {
        super(message);
        this.status = status;
        this.codigo = codigo;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCodigo() {
        return codigo;
    }
}
