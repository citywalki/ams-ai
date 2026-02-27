package pro.walkin.ams.common.security;

/**
 * 租户上下文管理器
 *
 * <p>使用 ThreadLocal 存储当前请求的租户ID。 租户ID通常从 HTTP Header "X-Tenant-Id" 解析，默认为 "default"。
 */
public class TenantContext {

  private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();
  private static final ThreadLocal<Long> CURRENT_TENANT_ID = new ThreadLocal<>();
  private static final ThreadLocal<String> CURRENT_TENANT_CODE = new ThreadLocal<>();
  private static final String DEFAULT_TENANT = "default";

  private TenantContext() {
    // 工具类，禁止实例化
  }

  /**
   * 获取当前租户ID
   *
   * @return 当前租户ID，如果未设置则返回默认租户 "default"
   */
  public static String getCurrentTenant() {
    String tenant = CURRENT_TENANT.get();
    return tenant != null ? tenant : DEFAULT_TENANT;
  }

  /**
   * 获取当前租户的数据库ID
   *
   * @return 当前租户的数据库ID，如果未设置则返回null
   */
  public static Long getCurrentTenantId() {
    return CURRENT_TENANT_ID.get();
  }

  /**
   * 获取当前租户代码
   *
   * @return 当前租户代码，如果未设置则返回默认租户代码
   */
  public static String getCurrentTenantCode() {
    String code = CURRENT_TENANT_CODE.get();
    return code != null ? code : DEFAULT_TENANT;
  }

  /**
   * 设置当前租户ID
   *
   * @param tenantId 租户ID，如果为 null 则清除当前租户上下文
   */
  public static void setCurrentTenant(String tenantId) {
    if (tenantId == null) {
      CURRENT_TENANT.remove();
    } else {
      CURRENT_TENANT.set(tenantId);
    }
  }

  /**
   * 设置当前租户的数据库ID
   *
   * @param tenantId 租户的数据库ID
   */
  public static void setCurrentTenantId(Long tenantId) {
    if (tenantId == null) {
      CURRENT_TENANT_ID.remove();
    } else {
      CURRENT_TENANT_ID.set(tenantId);
    }
  }

  /**
   * 设置当前租户代码
   *
   * @param tenantCode 租户代码
   */
  public static void setCurrentTenantCode(String tenantCode) {
    if (tenantCode == null) {
      CURRENT_TENANT_CODE.remove();
    } else {
      CURRENT_TENANT_CODE.set(tenantCode);
    }
  }

  /** 清除当前租户上下文 */
  public static void clear() {
    CURRENT_TENANT.remove();
    CURRENT_TENANT_ID.remove();
    CURRENT_TENANT_CODE.remove();
  }

  /**
   * 检查当前租户是否为默认租户
   *
   * @return 如果是默认租户则返回 true
   */
  public static boolean isDefaultTenant() {
    return DEFAULT_TENANT.equals(getCurrentTenantCode());
  }

  /**
   * 获取默认租户ID
   *
   * @return 默认租户ID
   */
  public static String getDefaultTenant() {
    return DEFAULT_TENANT;
  }
}
