package pro.walkin.ams.admin.auth.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.jwt.JsonWebToken;
import pro.walkin.ams.common.security.service.TokenPrincipalProvider;

import java.util.Optional;

/** TokenPrincipalProvider 实现类 */
@ApplicationScoped
public class TokenPrincipalProviderImpl implements TokenPrincipalProvider {

  @Inject TokenService tokenService;

  @Override
  public Optional<Long> extractUserId(String token) {
    Long userId = tokenService.getUserIdFromToken(token);
    return Optional.ofNullable(userId);
  }

  @Override
  public Optional<Long> extractTenantId(String token) {
    try {
      JsonWebToken principal = tokenService.validateAccessToken(token);
      if (principal == null) {
        return Optional.empty();
      }
      var tenantIdClaim = principal.getClaim("tenant_id");
      if (tenantIdClaim != null) {
        return Optional.of(Long.valueOf(tenantIdClaim.toString()));
      }
      return Optional.empty();
    } catch (Exception e) {
      return Optional.empty();
    }
  }
}
