package pro.walkin.ams.common.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;

/** 时间转换器 - 处理 Instant 与 LocalDateTime 之间的转换 */
public class TimeConverter {

  private static final ZoneId UTC_ZONE = ZoneOffset.UTC;
  private static final ZoneId DEFAULT_ZONE = ZoneId.systemDefault();

  private TimeConverter() {
    // 工具类，防止实例化
  }

  /** 获取当前时间戳 */
  public static Instant currentInstant() {
    return Instant.now();
  }

  /** 获取当前 UTC 时间 */
  public static ZonedDateTime currentUtcTime() {
    return ZonedDateTime.now(UTC_ZONE);
  }

  /** 获取当前本地时间 */
  public static LocalDateTime currentLocalTime() {
    return LocalDateTime.now();
  }

  /** LocalDateTime 转换为 Instant */
  public static Instant toInstant(LocalDateTime localDateTime) {
    return localDateTime.atZone(DEFAULT_ZONE).toInstant();
  }

  /** Instant 转换为 LocalDateTime */
  public static LocalDateTime toLocalDateTime(Instant instant) {
    return LocalDateTime.ofInstant(instant, DEFAULT_ZONE);
  }

  /** 检查是否为今天 */
  public static boolean isToday(Instant instant) {
    LocalDate today = LocalDate.now();
    LocalDate date = toLocalDateTime(instant).toLocalDate();
    return today.equals(date);
  }

  /** 检查两个时间是否为同一天 */
  public static boolean isSameDay(Instant date1, Instant date2) {
    LocalDate localDate1 = toLocalDateTime(date1).toLocalDate();
    LocalDate localDate2 = toLocalDateTime(date2).toLocalDate();
    return localDate1.equals(localDate2);
  }

  /** 添加天数 */
  public static Instant addDays(Instant instant, long days) {
    return instant.plusSeconds(days * 24 * 3600);
  }

  /** 添加小时 */
  public static Instant addHours(Instant instant, long hours) {
    return instant.plusSeconds(hours * 3600);
  }

  /** 添加分钟 */
  public static Instant addMinutes(Instant instant, long minutes) {
    return instant.plusSeconds(minutes * 60);
  }

  /** 获取当天的开始时间 */
  public static Instant startOfDay(Instant instant) {
    LocalDate localDate = toLocalDateTime(instant).toLocalDate();
    LocalDateTime startOfDay = localDate.atStartOfDay();
    return toInstant(startOfDay);
  }

  /** 获取当天的结束时间 */
  public static Instant endOfDay(Instant instant) {
    LocalDate localDate = toLocalDateTime(instant).toLocalDate();
    LocalDateTime endOfDay = localDate.atTime(23, 59, 59, 999999999);
    return toInstant(endOfDay);
  }
}
