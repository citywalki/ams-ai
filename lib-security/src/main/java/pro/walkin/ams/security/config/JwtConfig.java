package pro.walkin.ams.security.config;

import io.smallrye.config.ConfigMapping;

import java.time.Duration;

/** JWT配置映射 */
@ConfigMapping(prefix = "ams.auth.jwt")
public interface JwtConfig {

  /** 获取访问令牌过期时间 */
  Duration accessTokenExpiration();

  /** 获取刷新令牌过期时间 */
  Duration refreshTokenExpiration();

  /** 获取JWT签名密钥 */
  String secret();

  /** 获取JWT发行者 */
  String issuer();

  /** 获取JWT算法类型 */
  String algorithm();
}
