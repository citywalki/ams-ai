package pro.walkin.ams.admin.auth.service;

import io.quarkus.arc.Lock;
import io.smallrye.jwt.auth.principal.JWTCallerPrincipal;
import io.smallrye.jwt.auth.principal.JWTParser;
import io.smallrye.jwt.auth.principal.ParseException;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.system.User;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/** JWT令牌服务 */
@ApplicationScoped
public class TokenService implements pro.walkin.ams.common.security.service.TokenService {

  @Inject JWTParser jwtParser;

  /** 生成访问令牌 */
  @Lock
  public String generateAccessToken(User user) {
    Instant now = Instant.now();
    Instant expiresAt =
        now.plus(Constants.Auth.JWT_ACCESS_TOKEN_EXPIRATION_TIME, ChronoUnit.MILLIS);

    return Jwt.issuer(Constants.Auth.JWT_ISSUER)
        .upn(user.username)
        .subject(user.id.toString())
        .issuedAt(now)
        .expiresAt(expiresAt)
        .claim(Constants.Auth.CLAIM_USER_ID, user.id)
        .claim(Constants.Auth.CLAIM_USERNAME, user.username)
        .claim(Constants.Auth.CLAIM_TENANT_ID, user.tenant)
        .claim(Constants.Auth.CLAIM_ROLES, extractRoleCodes(user))
        .claim(Constants.Auth.CLAIM_PERMISSIONS, extractPermissionCodes(user))
        .sign();
  }

  /** 生成刷新令牌 */
  @Lock
  public String generateRefreshToken(User user) {
    Instant now = Instant.now();
    Instant expiresAt =
        now.plus(Constants.Auth.JWT_REFRESH_TOKEN_EXPIRATION_TIME, ChronoUnit.MILLIS);

    return Jwt.issuer(Constants.Auth.JWT_ISSUER)
        .upn(user.username)
        .subject(user.id.toString())
        .issuedAt(now)
        .expiresAt(expiresAt)
        .claim(Constants.Auth.CLAIM_USER_ID, user.id)
        .claim(Constants.Auth.CLAIM_TENANT_ID, user.tenant)
        .groups("REFRESH_TOKEN")
        .sign();
  }

  /** 提取用户的角色码列表 */
  private List<String> extractRoleCodes(User user) {
    if (user.roles == null) {
      return List.of();
    }
    return user.roles.stream().map(role -> role.code).collect(Collectors.toList());
  }

  /** 提取用户的权限码列表 */
  private List<String> extractPermissionCodes(User user) {
    // 通过角色提取权限（User 实体没有直接的 permissions 字段）
    Set<String> permissionCodes =
        user.roles != null
            ? user.roles.stream()
                .flatMap(
                    role -> role.permissions != null ? role.permissions.stream() : Stream.empty())
                .map(permission -> permission.code)
                .collect(java.util.stream.Collectors.toSet())
            : Set.of();

    return List.copyOf(permissionCodes);
  }

  /** 验证访问令牌 */
  public JWTCallerPrincipal validateAccessToken(String token) throws ParseException {
    // JWTParser会自动验证签名、过期时间、发行者等
    // parse()方法返回JsonWebToken，需要强制转换为JWTCallerPrincipal
    // 使用默认的公钥验证（RS256算法）
    JsonWebToken jsonWebToken = jwtParser.parse(token);
    if (jsonWebToken instanceof JWTCallerPrincipal) {
      return (JWTCallerPrincipal) jsonWebToken;
    } else {
      // 如果返回的不是JWTCallerPrincipal，则创建适配器
      // 这种情况不应该发生，但为了健壮性处理
      throw new RuntimeException("Parsed token is not a JWTCallerPrincipal");
    }
  }

  /** 解析令牌中的用户ID */
  public Long getUserIdFromToken(String token) {
    try {
      var principal = validateAccessToken(token);
      var userIdStr = principal.getClaim(Constants.Auth.CLAIM_USER_ID);
      return userIdStr != null ? Long.valueOf(userIdStr.toString()) : null;
    } catch (ParseException e) {
      // 令牌无效，返回null
      return null;
    }
  }

  /** 检查令牌是否包含指定权限 */
  public boolean hasPermission(String token, String permission) {
    try {
      var principal = validateAccessToken(token);
      if (principal == null) {
        return false;
      }
      var permissions = principal.getClaim(Constants.Auth.CLAIM_PERMISSIONS);
      if (permissions instanceof List) {
        return ((List<?>) permissions).contains(permission);
      }
      return false;
    } catch (ParseException e) {
      return false;
    }
  }

  /** 检查令牌是否包含指定角色 */
  public boolean hasRole(String token, String role) {
    try {
      var principal = validateAccessToken(token);
      if (principal == null) {
        return false;
      }
      return principal.getGroups().contains(role);
    } catch (Exception e) {
      return false;
    }
  }

  public boolean isTokenExpired(String token) {
    try {
      // 尝试验证令牌，如果验证成功则令牌未过期
      validateAccessToken(token);
      return false;
    } catch (ParseException e) {
      // 验证失败，令牌可能已过期或无效
      return true;
    }
  }
}
