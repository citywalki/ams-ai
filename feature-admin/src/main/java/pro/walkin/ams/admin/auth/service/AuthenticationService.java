package pro.walkin.ams.admin.auth.service;

import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.persistence.entity.system.Tenant;
import pro.walkin.ams.persistence.entity.system.Tenant_;
import pro.walkin.ams.persistence.entity.system.User;
import pro.walkin.ams.persistence.entity.system.User_;
import pro.walkin.ams.admin.auth.dto.AuthenticationResult;

/** 认证服务 */
@ApplicationScoped
public class AuthenticationService {

  private static final Logger LOG = LoggerFactory.getLogger(AuthenticationService.class);

  @Inject PasswordService passwordService;

  @Inject TokenService tokenService;

  /** 用户登录 */
  @Transactional
  public Optional<AuthenticationResult> login(String username, String password) {
    LOG.debug("Attempting login for user: {}", username);

    // 查找用户
    User user =
        User_.managedBlocking()
            .find(
                "lower(username) = lower(:username) or lower(email) = lower(:email)",
                Parameters.with("username", username).and("email", username).map())
            .firstResult();

    if (user == null) {
      LOG.warn("Login failed: User not found for username/email: {}", username);
      return Optional.empty();
    }

    // 检查账户是否被锁定
    if (user.lockedUntil != null && user.lockedUntil.isAfter(Instant.now())) {
      LOG.warn("Login failed: Account is locked for user: {}", username);
      return Optional.empty();
    }

    // 验证密码
    if (!passwordService.verifyPassword(password, user.passwordHash)) {
      // 登录失败，增加失败次数
      user.failedLoginAttempts =
          (user.failedLoginAttempts == null ? 0 : user.failedLoginAttempts) + 1;

      // 如果连续失败超过阈值，锁定账户一段时间
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = Instant.now().plusSeconds(30 * 60); // 锁定30分钟
        LOG.warn("Account locked due to multiple failed attempts: {}", username);
      }

      user.persist();
      LOG.warn("Login failed: Invalid password for user: {}", username);
      return Optional.empty();
    }

    // 登录成功，重置失败次数
    user.failedLoginAttempts = 0;
    user.lastLoginAt = Instant.now();

    user.persist();

    // 生成JWT令牌
    String accessToken = tokenService.generateAccessToken(user);
    String refreshToken = tokenService.generateRefreshToken(user);

    LOG.info("Successful login for user: {}", username);
    return Optional.of(new AuthenticationResult(user, accessToken, refreshToken));
  }

  /** 刷新访问令牌 */
  @Transactional
  public Optional<String> refreshAccessToken(String refreshToken) {
    if (tokenService.isTokenExpired(refreshToken)) {
      LOG.warn("Token refresh failed: Refresh token is expired");
      return Optional.empty();
    }

    Long userId = tokenService.getUserIdFromToken(refreshToken);
    if (userId == null) {
      LOG.warn("Token refresh failed: Invalid refresh token");
      return Optional.empty();
    }

    User user = User_.managedBlocking().findById(userId);
    if (user == null) {
      LOG.warn("Token refresh failed: User not found for id: {}", userId);
      return Optional.empty();
    }

    // 检查用户状态
    if (!Constants.User.STATUS_ACTIVE.equals(user.status)) {
      LOG.warn("Token refresh failed: User account is not active: {}", user.username);
      return Optional.empty();
    }

    String newAccessToken = tokenService.generateAccessToken(user);
    LOG.debug("Access token refreshed for user: {}", user.username);
    return Optional.of(newAccessToken);
  }

  /** 用户注册 */
  @Transactional
  public User registerUser(String username, String email, String password, String roleCode) {
    // 检查用户名和邮箱是否已存在
    User existingByUsername =
        User_.managedBlocking()
            .find("lower(username) = lower(?1)", username.toLowerCase())
            .firstResult();
    if (existingByUsername != null) {
      throw new IllegalArgumentException("Username already exists: " + username);
    }

    User existingByEmail =
        User_.managedBlocking().find("lower(email) = lower(?1)", email.toLowerCase()).firstResult();
    if (existingByEmail != null) {
      throw new IllegalArgumentException("Email already exists: " + email);
    }

    // 创建新用户
    User newUser = new User();
    newUser.username = username;
    newUser.email = email;
    newUser.passwordHash = passwordService.hashPassword(password);
    newUser.status = Constants.User.STATUS_ACTIVE;
    newUser.passwordLastUpdated = Instant.now();
    newUser.failedLoginAttempts = 0;

    // 设置默认租户
    Tenant defaultTenant = Tenant_.managedBlocking().find("code = ?1", "default").firstResult();
    if (defaultTenant == null) {
      // 如果没有默认租户，则创建一个
      defaultTenant = new Tenant();
      defaultTenant.code = "default";
      defaultTenant.name = "Default Tenant";
      defaultTenant.status = "ACTIVE";
      defaultTenant.persistAndFlush();
    }
    newUser.tenant = defaultTenant.id;

    newUser.persistAndFlush();

    LOG.info("New user registered: {}", username);
    return newUser;
  }

  /** 更改用户密码 */
  @Transactional
  public boolean changePassword(Long userId, String oldPassword, String newPassword) {
    User user = User_.managedBlocking().findById(userId);
    if (user == null) {
      LOG.warn("Password change failed: User not found for id: {}", userId);
      return false;
    }

    // 验证旧密码
    if (!passwordService.verifyPassword(oldPassword, user.passwordHash)) {
      LOG.warn("Password change failed: Invalid old password for user: {}", userId);
      return false;
    }

    // 验证新密码强度
    if (!passwordService.validatePasswordStrength(newPassword)) {
      LOG.warn(
          "Password change failed: New password does not meet strength requirements for user: {}",
          userId);
      return false;
    }

    // 更新密码
    user.passwordHash = passwordService.hashPassword(newPassword);
    user.passwordLastUpdated = Instant.now();
    user.persist();

    LOG.info("Password changed successfully for user: {}", userId);
    return true;
  }

  /** 通过ID获取用户，包含角色和权限 */
  public User getUserWithRolesAndPermissions(Long userId) {
    return User_.managedBlocking()
        .find(
            "SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles r LEFT JOIN FETCH r.permissions WHERE u.id = ?1",
            userId)
        .stream()
        .findFirst()
        .orElse(null);
  }

  /** 通过用户名获取用户，包含角色和权限 */
  public User getUserWithRolesAndPermissionsByUsername(String username) {
    return User_.managedBlocking()
        .find(
            "SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles r LEFT JOIN FETCH r.permissions WHERE u.username = ?1",
            username)
        .stream()
        .findFirst()
        .orElse(null);
  }
}
