package pro.walkin.ams.admin.auth.dto;

import pro.walkin.ams.persistence.entity.system.User;

/** 认证结果类 */
public class AuthenticationResult {
  public final User user;
  public final String accessToken;
  public final String refreshToken;

  public AuthenticationResult(User user, String accessToken, String refreshToken) {
    this.user = user;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
