package pro.walkin.ams.boot.support;

import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.UUID;

public class TestDataFactory {

  public static User createUser(String username, Long tenantId) {
    User user = new User();
    user.username = username;
    user.email = username + "@test.com";
    user.passwordHash = "test-hash";
    user.tenant = tenantId;
    return user;
  }

  public static Role createRole(String code, Long tenantId) {
    Role role = new Role();
    role.code = code;
    role.name = "Test Role " + code;
    role.tenant = tenantId;
    return role;
  }

  public static String uniqueCode(String prefix) {
    return prefix + "_" + UUID.randomUUID().toString().substring(0, 8);
  }
}
