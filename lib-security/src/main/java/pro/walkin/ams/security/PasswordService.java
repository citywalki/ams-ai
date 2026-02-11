package pro.walkin.ams.security;

import jakarta.enterprise.context.ApplicationScoped;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class PasswordService {

  private static final Logger LOG = LoggerFactory.getLogger(PasswordService.class);
  private static final String HASH_ALGORITHM = "HmacSHA256";
  // TODO: Move salt to configuration for production use
  private static final String SECRET_SALT = "ams-ai-security-salt-2025-change-in-production";

  public String hashPassword(String password) {
    if (password == null) {
      throw new IllegalArgumentException("Password cannot be null");
    }

    try {
      Mac hmac = Mac.getInstance(HASH_ALGORITHM);
      SecretKeySpec secretKey =
          new SecretKeySpec(SECRET_SALT.getBytes(StandardCharsets.UTF_8), HASH_ALGORITHM);
      hmac.init(secretKey);
      byte[] hashBytes = hmac.doFinal(password.getBytes(StandardCharsets.UTF_8));
      return Base64.getEncoder().encodeToString(hashBytes);
    } catch (Exception e) {
      LOG.error("Password hashing failed", e);
      throw new RuntimeException("Password hashing failed", e);
    }
  }

  public boolean verifyPassword(String password, String hash) {
    if (password == null || hash == null) {
      return false;
    }

    // 首先尝试新哈希验证
    String computedHash = hashPassword(password);
    if (hash.equals(computedHash)) {
      return true;
    }

    // 如果新哈希不匹配，检查是否为旧格式（明文存储）
    // 这是为了向后兼容，在升级后允许现有用户登录
    if (password.equals(hash)) {
      LOG.warn(
          "Password stored in old format (plaintext or insecure hash). User should reset password.");
      return true;
    }

    return false;
  }

  public boolean validatePasswordStrength(String password) {
    return password != null && password.length() >= 8;
  }
}
