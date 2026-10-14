package pe.com.promantenimineto.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class EvidenciaArchivoService {

    private final Path directorioBase;

    private static final long TAMANO_MAXIMO = 20L * 1024 * 1024;

    private static final Set<String> TIPOS_PERMITIDOS = Set.of(
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm"
    );

    public EvidenciaArchivoService(
        @Value("${app.upload.dir}") String directorio
    ) throws IOException {
        this.directorioBase = Paths.get(directorio)
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(this.directorioBase);
    }

    public String guardar(MultipartFile archivo, String codigoIncidencia)
            throws IOException {

        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío.");
        }

        if (archivo.getSize() > TAMANO_MAXIMO) {
            throw new IllegalArgumentException(
                "Cada archivo debe pesar como máximo 20 MB."
            );
        }

        String tipo = archivo.getContentType();

        if (tipo == null || !TIPOS_PERMITIDOS.contains(tipo)) {
            throw new IllegalArgumentException(
                "Formato no permitido. Usa JPG, PNG, WEBP, MP4 o WEBM."
            );
        }

        Path directorioIncidencia = directorioBase
                .resolve(codigoIncidencia)
                .normalize();

        if (!directorioIncidencia.startsWith(directorioBase)) {
            throw new IllegalArgumentException("Ruta no válida.");
        }

        Files.createDirectories(directorioIncidencia);

        String extension = switch (tipo) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "video/mp4" -> ".mp4";
            case "video/webm" -> ".webm";
            default -> throw new IllegalArgumentException(
                "Formato no permitido."
            );
        };

        String nombreArchivo = UUID.randomUUID() + extension;

        Path destino = directorioIncidencia
                .resolve(nombreArchivo)
                .normalize();

        if (!destino.startsWith(directorioIncidencia)) {
            throw new IllegalArgumentException("Ruta no válida.");
        }

        archivo.transferTo(destino);

        return directorioBase.relativize(destino).toString()
                .replace("\\", "/");
    }
    
    public void eliminar(String rutaRelativa) throws IOException {
        Path archivo = directorioBase
                .resolve(rutaRelativa)
                .normalize();

        if (!archivo.startsWith(directorioBase)) {
            throw new IllegalArgumentException("Ruta no válida.");
        }

        Files.deleteIfExists(archivo);
    }
    
}