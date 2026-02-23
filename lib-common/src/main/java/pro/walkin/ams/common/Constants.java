package pro.walkin.ams.common;

/**
 * 系统常量定义
 *
 * 已添加SEVERITY_WARNING和SEVERITY_UNKNOWN常量 4. 已删除重复的AlarmPolicy类
 *
 * <p>注意：重复常量值相同但语义不同，已添加注释说明。
 */
public final class Constants {

  private Constants() {
    // 工具类，防止实例化
  }

  /** 租户相关常量 */
  public static final class Tenant {
    private Tenant() {}

    public static final String DEFAULT_TENANT_CODE = "default";
    public static final String SUPER_ADMIN_TENANT_CODE = "system";

    // 租户状态
    // 注意：STATUS_ACTIVE和STATUS_INACTIVE值与User类中相同，但语义不同（租户状态 vs 用户状态）
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_INACTIVE = "INACTIVE";
    public static final String STATUS_SUSPENDED = "SUSPENDED";
  }

  /** 用户相关常量 */
  public static final class User {
    private User() {}

    // 用户角色
    public static final String ROLE_SUPER_ADMIN = "SUPER_ADMIN";
    public static final String ROLE_TENANT_ADMIN = "TENANT_ADMIN";
    public static final String ROLE_USER = "USER";
    public static final String ROLE_VIEWER = "VIEWER";

    // 用户状态
    // 注意：STATUS_ACTIVE和STATUS_INACTIVE值与Tenant类中相同，但语义不同（用户状态 vs 租户状态）
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_INACTIVE = "INACTIVE";
    public static final String STATUS_LOCKED = "LOCKED";
  }

  /** 告警相关常量 */
  public static final class Alarm {
    private Alarm() {}

    public enum Severity {
      CRITICAL,
      HIGH,
      MEDIUM,
      LOW,
      INFO,
      WARNING,
      UNKNOWN
    }

    public enum Status {
      NEW,
      ACKNOWLEDGED,
      IN_PROGRESS,
      RESOLVED,
      CLOSED
    }

    // 严重程度
    public static final String SEVERITY_CRITICAL = "CRITICAL";
    public static final String SEVERITY_HIGH = "HIGH";
    public static final String SEVERITY_MEDIUM = "MEDIUM";
    public static final String SEVERITY_LOW = "LOW";
    public static final String SEVERITY_INFO = "INFO";
    public static final String SEVERITY_WARNING = "WARNING";
    public static final String SEVERITY_UNKNOWN = "UNKNOWN";

    // 状态
    public static final String STATUS_NEW = "NEW";
    public static final String STATUS_ACKNOWLEDGED = "ACKNOWLEDGED";
    public static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    public static final String STATUS_RESOLVED = "RESOLVED";
    public static final String STATUS_CLOSED = "CLOSED";

    // 来源
    public static final String SOURCE_PROMETHEUS = "prometheus";
    public static final String SOURCE_ZABBIX = "zabbix";
    public static final String SOURCE_CUSTOM = "custom";
    public static final String SOURCE_EAP_MQ = "eap_mq";
  }

  /** 策略类型 */
  public static final class Policy {
    private Policy() {}

    public static final String TYPE_ROUTING = "ROUTING";
    public static final String TYPE_SILENCING = "SILENCING";
    public static final String TYPE_AGGREGATION = "AGGREGATION";
    public static final String TYPE_ESCALATION = "ESCALATION";
    public static final String TYPE_CLASSIFICATION = "CLASSIFICATION";
  }

  /** 通知渠道类型 */
  public static final class NotificationChannel {
    private NotificationChannel() {}

    public static final String TYPE_EMAIL = "EMAIL";
    public static final String TYPE_SMS = "SMS";
    public static final String TYPE_DINGTALK = "DINGTALK";
    public static final String TYPE_WECHAT_WORK = "WECHAT_WORK";
    public static final String TYPE_SLACK = "SLACK";
    public static final String TYPE_WEBHOOK = "WEBHOOK";
  }

  /** AI分析类型 */
  public static final class AiAnalysis {
    private AiAnalysis() {}

    public static final String TYPE_CLASSIFICATION = "CLASSIFICATION";
    public static final String TYPE_ROOT_CAUSE = "ROOT_CAUSE";
    public static final String TYPE_SIMILARITY = "SIMILARITY";
    public static final String TYPE_TREND = "TREND";
    public static final String TYPE_DEDUPLICATION = "DEDUPLICATION";
  }

  /** 时间格式 */
  public static final class DateFormat {
    private DateFormat() {}

    public static final String ISO_8601 = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
    public static final String ISO_8601_SIMPLE = "yyyy-MM-dd'T'HH:mm:ss";
    public static final String DATE_ONLY = "yyyy-MM-dd";
    public static final String TIME_ONLY = "HH:mm:ss";
    public static final String DATETIME = "yyyy-MM-dd HH:mm:ss";
  }

  /** 分页 */
  public static final class Pagination {
    private Pagination() {}

    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
    public static final int DEFAULT_PAGE_NUMBER = 1;
  }

  /** 集群内主键 */
  public static final class Cluster {
    private Cluster() {}

    public static final String ALERT_EVENTS_QUEUE = "alert-events";
  }

  /** 缓存Key前缀 */
  public static final class Cache {
    private Cache() {}

    public static final String TENANT_PREFIX = "tenant:";
    public static final String USER_PREFIX = "user:";
    public static final String ALARM_PREFIX = "alarm:";
    public static final String POLICY_PREFIX = "policy:";
    public static final String CHANNEL_PREFIX = "channel:";

    // 缓存过期时间（秒）
    public static final long TENANT_TTL = 3600L; // 1小时
    public static final long USER_TTL = 7200L; // 2小时
    public static final long POLICY_TTL = 1800L; // 30分钟
    public static final long ALARM_TTL = 300L; // 5分钟
  }

  /** HTTP相关 */
  public static final class Http {
    private Http() {}

    public static final String HEADER_TENANT_ID = "X-Tenant-Id";
    public static final String HEADER_TENANT_CODE = "X-Tenant-Code";
    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String HEADER_USER_ID = "X-User-Id";
    public static final String HEADER_REQUEST_ID = "X-Request-Id";
  }

  /** 晶圆厂设备常量 */
  public static final class FabEquipment {
    private FabEquipment() {}

    // 设备状态
    public static final String STATUS_OPERATIONAL = "OPERATIONAL";
    public static final String STATUS_MAINTENANCE = "MAINTENANCE";
    public static final String STATUS_DOWN = "DOWN";
    public static final String STATUS_STANDBY = "STANDBY";

    // 设备类型
    public static final String TYPE_ETCH = "ETCH";
    public static final String TYPE_LITHOGRAPHY = "LITHOGRAPHY";
    public static final String TYPE_CVD = "CVD";
    public static final String TYPE_PVD = "PVD";
    public static final String TYPE_CMP = "CMP";
  }

  /** 通知记录常量 */
  public static final class Notification {
    private Notification() {}

    // 通知状态
    // 注意：STATUS_PENDING和STATUS_FAILED值与AiAnalysisResult类中相同，但语义不同（通知状态 vs AI分析状态）
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_SENT = "SENT";
    public static final String STATUS_FAILED = "FAILED";
    public static final String STATUS_RETRY = "RETRY";
  }

  /** 通知模板常量 */
  public static final class NotificationTemplate {
    private NotificationTemplate() {}

    // 内容类型
    public static final String CONTENT_TYPE_TEXT = "TEXT";
    public static final String CONTENT_TYPE_HTML = "HTML";
    public static final String CONTENT_TYPE_MARKDOWN = "MARKDOWN";
  }

  /** 审计日志常量 */
  public static final class AuditLog {
    private AuditLog() {}

    // 操作类型
    public static final String ACTION_CREATE = "CREATE";
    public static final String ACTION_UPDATE = "UPDATE";
    public static final String ACTION_DELETE = "DELETE";
    public static final String ACTION_READ = "READ";
    public static final String ACTION_LOGIN = "LOGIN";
    public static final String ACTION_LOGOUT = "LOGOUT";
  }

  /** AI分析结果常量 */
  public static final class AiAnalysisResult {
    private AiAnalysisResult() {}

    // AI分析状态
    // 注意：STATUS_PENDING和STATUS_FAILED值与Notification类中相同，但语义不同（AI分析状态 vs 通知状态）
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_PROCESSING = "PROCESSING";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_FAILED = "FAILED";
  }

  /** 告警规则常量 */
  public static final class AlarmRule {
    private AlarmRule() {}

    // 规则类型
    public static final String RULE_TYPE_SILENCE = "SILENCE";
    public static final String RULE_TYPE_ROUTING = "ROUTING";
    public static final String RULE_TYPE_ESCALATION = "ESCALATION";
    public static final String RULE_TYPE_CLASSIFICATION = "CLASSIFICATION";
  }

  /** 认证和授权相关常量 */
  public static final class Auth {
    private Auth() {}

    // JWT令牌相关常量
    public static final String JWT_HEADER = "Authorization";
    public static final String JWT_PREFIX = "Bearer ";
    public static final String JWT_SECRET_KEY = "jwt.secret.key"; // 从配置获取
    public static final long JWT_ACCESS_TOKEN_EXPIRATION_TIME = 15 * 60 * 1000L; // 15分钟
    public static final long JWT_REFRESH_TOKEN_EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000L; // 7天
    public static final String JWT_ISSUER = "ams-ai-auth-service";

    // 权限相关常量
    public static final String PERMISSION_SEPARATOR = ",";
    
    // 内置角色
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String ROLE_USER = "USER";
    public static final String ROLE_MANAGER = "MANAGER";
    
    // 权限码前缀
    public static final String PERMISSION_ALARM_READ = "ALARM_READ";
    public static final String PERMISSION_ALARM_WRITE = "ALARM_WRITE";
    public static final String PERMISSION_ALARM_DELETE = "ALARM_DELETE";
    public static final String PERMISSION_USER_READ = "USER_READ";
    public static final String PERMISSION_USER_WRITE = "USER_WRITE";
    public static final String PERMISSION_TENANT_MANAGE = "TENANT_MANAGE";
    public static final String PERMISSION_ADMIN_USERS = "admin:users";
    
    // JWT声明字段
    public static final String CLAIM_ROLES = "groups";
    public static final String CLAIM_PERMISSIONS = "permissions";
    public static final String CLAIM_TENANT_ID = "tenant_id";
    public static final String CLAIM_USER_ID = "user_id";
    public static final String CLAIM_USERNAME = "username";
  }

  /** 错误码常量 */
  public static final class ErrorCode {
    private ErrorCode() {}
    
    // 系统错误
    public static final String INTERNAL_ERROR = "INTERNAL_ERROR";
    public static final String SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";
    public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
    public static final String NOT_FOUND = "NOT_FOUND";
    public static final String BUSINESS_ERROR = "BUSINESS_ERROR";
    public static final String UNAUTHORIZED = "UNAUTHORIZED";
    public static final String FORBIDDEN = "FORBIDDEN";
    public static final String BAD_REQUEST = "BAD_REQUEST";
    public static final String METHOD_NOT_ALLOWED = "METHOD_NOT_ALLOWED";
    public static final String UNSUPPORTED_MEDIA_TYPE = "UNSUPPORTED_MEDIA_TYPE";
    
    // 业务错误
    public static final String AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED";
    public static final String INVALID_TOKEN = "INVALID_TOKEN";
    public static final String INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS";
    public static final String RESOURCE_CONFLICT = "RESOURCE_CONFLICT";
  }
}
