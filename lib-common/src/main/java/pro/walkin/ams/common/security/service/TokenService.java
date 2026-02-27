package pro.walkin.ams.common.security.service;

import io.smallrye.jwt.auth.principal.JWTCallerPrincipal;
import io.smallrye.jwt.auth.principal.ParseException;

/**
 * Token service interface for JWT operations. Implementation is provided by feature-admin module.
 */
public interface TokenService {

  /** Validate access token and return principal */
  JWTCallerPrincipal validateAccessToken(String token) throws ParseException;

  /** Check if token is expired */
  boolean isTokenExpired(String token);
}
