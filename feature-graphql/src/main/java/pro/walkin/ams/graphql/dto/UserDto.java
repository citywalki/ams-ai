package pro.walkin.ams.graphql.dto;

import org.eclipse.microprofile.graphql.Ignore;
import org.eclipse.microprofile.graphql.Type;
import pro.walkin.ams.persistence.entity.system.Role;

import java.time.Instant;
import java.util.Set;

@Type("User")
public class UserDto {
  public Long id;
  public Long tenant;
  public String username;
  public String email;
  public String status;
  public Set<Role> roles;
  public Instant lastLoginAt;
  public Instant createdAt;
  public Instant updatedAt;

  @Ignore public String passwordHash;

  @Ignore public java.util.Map<String, Object> preferences;

  @Ignore public Instant passwordLastUpdated;

  @Ignore public Instant lockedUntil;

  @Ignore public Integer failedLoginAttempts;
}
