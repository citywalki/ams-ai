package pro.walkin.ams.common.security.service;

import java.util.Optional;

/**
 * Provider for extracting user principal information from JWT tokens. Implementation is provided by
 * the authentication module.
 */
public interface TokenPrincipalProvider {

  /**
   * Extract user ID from token
   *
   * @param token JWT token
   * @return user ID or empty if invalid
   */
  Optional<Long> extractUserId(String token);

  /**
   * Extract tenant ID from token
   *
   * @param token JWT token
   * @return tenant ID or empty if invalid
   */
  Optional<Long> extractTenantId(String token);
}
