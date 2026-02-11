package pro.walkin.ams.security;

import jakarta.annotation.Priority;
import io.quarkus.logging.Log;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestFilter;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import pro.walkin.ams.security.filter.AuthenticationFilter;
import pro.walkin.ams.security.filter.AuthorizationFilter;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;

/**
 * 安全模块配置
 * 
 * 初始化安全组件和相关配置
 */
@ApplicationScoped
public class SecurityModule {

    @ConfigProperty(name = "quarkus.smallrye-jwt.sign.key-location", defaultValue = "private-key.pem")
    String keyLocation;

    void onStart(@Observes StartupEvent event) {
        Log.info("Initializing Security Module...");
    }

    /**
     * 生成JWT签名密钥对（开发用途）
     */
    public static KeyPair generateKeyPair() {
        try {
            KeyPairGenerator keyGen = KeyPairGenerator.getInstance("RSA");
            keyGen.initialize(2048);
            return keyGen.generateKeyPair();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Failed to generate key pair", e);
        }
    }

    /**
     * 将公钥转换为PEM格式
     */
    public static String encodePublicKeyToPEM(PublicKey publicKey) {
        String encoded = Base64.getEncoder().encodeToString(publicKey.getEncoded());
        StringBuilder pem = new StringBuilder();
        pem.append("-----BEGIN PUBLIC KEY-----\n");
        for (int i = 0; i < encoded.length(); i += 64) {
            pem.append(encoded, i, Math.min(i + 64, encoded.length())).append("\n");
        }
        pem.append("-----END PUBLIC KEY-----\n");
        return pem.toString();
    }

    /**
     * 将私钥转换为PEM格式
     */
    public static String encodePrivateKeyToPEM(PrivateKey privateKey) {
        String encoded = Base64.getEncoder().encodeToString(privateKey.getEncoded());
        StringBuilder pem = new StringBuilder();
        pem.append("-----BEGIN PRIVATE KEY-----\n");
        for (int i = 0; i < encoded.length(); i += 64) {
            pem.append(encoded, i, Math.min(i + 64, encoded.length())).append("\n");
        }
        pem.append("-----END PRIVATE KEY-----\n");
        return pem.toString();
    }
}