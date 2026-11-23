
package pe.com.promantenimineto.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.AccessToken;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Date;

@Configuration
public class FirebaseAdminConfig {

    @Value("${firebase.credentials.path:}")
    private String credentialsPath;

    @Value("${firebase.project-id:demo-pms276}")
    private String projectId;

    @Value("${firebase.auth.emulator-host:}")
    private String emulatorHost;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {

        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        FirebaseOptions.Builder builder = FirebaseOptions.builder()
                .setProjectId(projectId);

        if (emulatorHost != null && !emulatorHost.isBlank()) {
            AccessToken token = new AccessToken(
                    "pms276-emulator",
                    new Date(System.currentTimeMillis() + 3_600_000));
            builder.setCredentials(GoogleCredentials.create(token));
        } else if (credentialsPath != null && !credentialsPath.isBlank()) {
            try (FileInputStream serviceAccount = new FileInputStream(credentialsPath)) {
                builder.setCredentials(GoogleCredentials.fromStream(serviceAccount));
            }
        } else {
            throw new IllegalStateException(
                    "Configura FIREBASE_AUTH_EMULATOR_HOST para desarrollo "
                            + "o FIREBASE_CREDENTIALS_PATH para un proyecto Firebase aislado.");
        }

        return FirebaseApp.initializeApp(builder.build());
    }

    @Bean
    public FirebaseAuth firebaseAuth(FirebaseApp app) {
        return FirebaseAuth.getInstance(app);
    }
}
