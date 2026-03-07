package pro.walkin.ams.boot.support;

import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/** 测试数据构建器，提供流式 API 创建测试实体 */
public final class TestDataBuilder {

  private TestDataBuilder() {
    // 工具类，禁止实例化
  }

  /** 创建用户构建器 */
  public static UserBuilder user() {
    return new UserBuilder();
  }

  /** 创建角色构建器 */
  public static RoleBuilder role() {
    return new RoleBuilder();
  }

  /** 创建权限构建器 */
  public static PermissionBuilder permission() {
    return new PermissionBuilder();
  }

  /**
   * 生成唯一代码
   *
   * @param prefix 前缀
   * @return 唯一代码
   */
  public static String uniqueCode(String prefix) {
    return prefix + "_" + UUID.randomUUID().toString().substring(0, 8);
  }

  /** 用户构建器 */
  public static class UserBuilder {
    private Long id = System.currentTimeMillis();
    private String username = TestConstants.TEST_USERNAME;
    private String email = TestConstants.TEST_EMAIL;
    private String passwordHash = "hashed_password";
    private Long tenant = TestConstants.DEFAULT_TENANT_ID;
    private Set<Role> roles = new HashSet<>();

    public UserBuilder withId(Long id) {
      this.id = id;
      return this;
    }

    public UserBuilder withUsername(String username) {
      this.username = username;
      return this;
    }

    public UserBuilder withEmail(String email) {
      this.email = email;
      return this;
    }

    public UserBuilder withPasswordHash(String passwordHash) {
      this.passwordHash = passwordHash;
      return this;
    }

    public UserBuilder withTenant(Long tenant) {
      this.tenant = tenant;
      return this;
    }

    public UserBuilder withRoles(Set<Role> roles) {
      this.roles = new HashSet<>(roles);
      return this;
    }

    public UserBuilder withRole(Role role) {
      this.roles.add(role);
      return this;
    }

    public User build() {
      User user = new User();
      user.id = id;
      user.username = username;
      user.email = email;
      user.passwordHash = passwordHash;
      user.tenant = tenant;
      user.roles = roles;
      return user;
    }
  }

  /** 角色构建器 */
  public static class RoleBuilder {
    private Long id = System.currentTimeMillis();
    private String code = "TEST_ROLE";
    private String name = "Test Role";
    private String description = "Test role description";
    private Long tenant = TestConstants.DEFAULT_TENANT_ID;
    private Set<Permission> permissions = new HashSet<>();

    public RoleBuilder withId(Long id) {
      this.id = id;
      return this;
    }

    public RoleBuilder withCode(String code) {
      this.code = code;
      return this;
    }

    public RoleBuilder withName(String name) {
      this.name = name;
      return this;
    }

    public RoleBuilder withDescription(String description) {
      this.description = description;
      return this;
    }

    public RoleBuilder withTenant(Long tenant) {
      this.tenant = tenant;
      return this;
    }

    public RoleBuilder withPermissions(Set<Permission> permissions) {
      this.permissions = new HashSet<>(permissions);
      return this;
    }

    public RoleBuilder withPermission(Permission permission) {
      this.permissions.add(permission);
      return this;
    }

    public Role build() {
      Role role = new Role();
      role.id = id;
      role.code = code;
      role.name = name;
      role.description = description;
      role.tenant = tenant;
      role.permissions = permissions;
      return role;
    }
  }

  /** 权限构建器 */
  public static class PermissionBuilder {
    private Long id = System.currentTimeMillis();
    private String code = "test:permission";
    private String name = "Test Permission";
    private String description = "Test permission description";
    private Long tenant = TestConstants.DEFAULT_TENANT_ID;

    public PermissionBuilder withId(Long id) {
      this.id = id;
      return this;
    }

    public PermissionBuilder withCode(String code) {
      this.code = code;
      return this;
    }

    public PermissionBuilder withName(String name) {
      this.name = name;
      return this;
    }

    public PermissionBuilder withDescription(String description) {
      this.description = description;
      return this;
    }

    public PermissionBuilder withTenant(Long tenant) {
      this.tenant = tenant;
      return this;
    }

    public Permission build() {
      Permission permission = new Permission();
      permission.id = id;
      permission.code = code;
      permission.name = name;
      permission.description = description;
      permission.tenant = tenant;
      return permission;
    }
  }
}
