package pro.walkin.ams.boot.support;

/**
 * 测试常量类，集中管理所有测试配置和默认值
 */
public final class TestConstants {

  private TestConstants() {
    // 工具类，禁止实例化
  }

  // ==================== 租户相关 ====================
  public static final Long DEFAULT_TENANT_ID = 1L;
  public static final String DEFAULT_TENANT_CODE = "default";

  // ==================== 用户相关 ====================
  public static final String TEST_USERNAME = "test_user";
  public static final String TEST_PASSWORD = "test_password";
  public static final String TEST_EMAIL = "test@example.com";

  // ==================== 管理员用户 ====================
  public static final String ADMIN_USERNAME = "admin";
  public static final String ADMIN_PASSWORD = "admin123";

  // ==================== JWT 配置 ====================
  public static final String JWT_SIGN_KEY_LOCATION = "privateKey.jwk";

  // ==================== HTTP 状态码 ====================
  public static final int HTTP_OK = 200;
  public static final int HTTP_CREATED = 201;
  public static final int HTTP_NO_CONTENT = 204;
  public static final int HTTP_BAD_REQUEST = 400;
  public static final int HTTP_UNAUTHORIZED = 401;
  public static final int HTTP_NOT_FOUND = 404;

  // ==================== 测试数据前缀 ====================
  public static final String TEST_PREFIX_USER = "USER";
  public static final String TEST_PREFIX_ROLE = "ROLE";
  public static final String TEST_PREFIX_PERMISSION = "PERM";
}
