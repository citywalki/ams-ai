package pro.walkin.ams.common.util;

import pro.walkin.ams.common.Constants;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/** 日期格式化器 - 处理日期时间的格式化与解析 */
public class DateFormatter {

  private static final ZoneId UTC_ZONE = ZoneOffset.UTC;
  private static final ZoneId DEFAULT_ZONE = ZoneId.systemDefault();

  // 预定义的格式化器
  public static final DateTimeFormatter ISO_FORMATTER =
      DateTimeFormatter.ofPattern(Constants.DateFormat.ISO_8601);
  public static final DateTimeFormatter SIMPLE_ISO_FORMATTER =
      DateTimeFormatter.ofPattern(Constants.DateFormat.ISO_8601_SIMPLE);
  public static final DateTimeFormatter DATETIME_FORMATTER =
      DateTimeFormatter.ofPattern(Constants.DateFormat.DATETIME);
  public static final DateTimeFormatter DATE_FORMATTER =
      DateTimeFormatter.ofPattern(Constants.DateFormat.DATE_ONLY);
  public static final DateTimeFormatter TIME_FORMATTER =
      DateTimeFormatter.ofPattern(Constants.DateFormat.TIME_ONLY);

  private DateFormatter() {
    // 工具类，防止实例化
  }

  /** 格式化为 UTC 字符串 */
  public static String toUtcString(Instant instant) {
    return ISO_FORMATTER.format(instant.atZone(UTC_ZONE));
  }

  /** 从 UTC 字符串解析 */
  public static Instant fromUtcString(String utcString) {
    return ZonedDateTime.parse(utcString, ISO_FORMATTER).toInstant();
  }

  /** 使用自定义模式格式化 */
  public static String format(Instant instant, String pattern) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
    return formatter.format(instant.atZone(DEFAULT_ZONE));
  }

  /** 使用指定格式化器格式化 */
  public static String format(Instant instant, DateTimeFormatter formatter) {
    return formatter.format(instant.atZone(DEFAULT_ZONE));
  }

  /** 使用自定义模式解析 */
  public static Instant parse(String dateString, String pattern) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
    LocalDateTime localDateTime = LocalDateTime.parse(dateString, formatter);
    return TimeConverter.toInstant(localDateTime);
  }

  /** 使用指定格式化器解析 */
  public static Instant parse(String dateString, DateTimeFormatter formatter) {
    LocalDateTime localDateTime = LocalDateTime.parse(dateString, formatter);
    return TimeConverter.toInstant(localDateTime);
  }
}
