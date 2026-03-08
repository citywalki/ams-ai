package pro.walkin.ams.common.util;

import pro.walkin.ams.common.Constants;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;

/** LocalDateTime 转换器 - 处理 LocalDateTime 的转换、计算与格式化 */
public class LocalDateTimeConverter {

  private static final ZoneId DEFAULT_ZONE = ZoneId.systemDefault();

  private LocalDateTimeConverter() {}

  /** 获取当前时间 */
  public static LocalDateTime now() {
    return LocalDateTime.now();
  }

  /** 获取当前 UTC 时间 */
  public static ZonedDateTime nowUtc() {
    return ZonedDateTime.now(ZoneId.of("UTC"));
  }

  /** LocalDateTime 转换为 Instant */
  public static Instant toInstant(LocalDateTime localDateTime) {
    return localDateTime.atZone(DEFAULT_ZONE).toInstant();
  }

  /** Instant 转换为 LocalDateTime */
  public static LocalDateTime fromInstant(Instant instant) {
    return LocalDateTime.ofInstant(instant, DEFAULT_ZONE);
  }

  /** LocalDateTime 转换为时间戳（毫秒） */
  public static long toEpochMillis(LocalDateTime localDateTime) {
    return localDateTime.atZone(DEFAULT_ZONE).toInstant().toEpochMilli();
  }

  /** 时间戳（毫秒）转换为 LocalDateTime */
  public static LocalDateTime fromEpochMillis(long epochMillis) {
    return LocalDateTime.ofInstant(Instant.ofEpochMilli(epochMillis), DEFAULT_ZONE);
  }

  /** 格式化为 ISO 字符串 */
  public static String format(LocalDateTime localDateTime) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(Constants.DateFormat.ISO_8601_SIMPLE);
    return formatter.format(localDateTime);
  }

  /** 使用自定义模式格式化 */
  public static String format(LocalDateTime localDateTime, String pattern) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
    return formatter.format(localDateTime);
  }

  /** 从 ISO 字符串解析 */
  public static LocalDateTime parse(String dateTimeString) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(Constants.DateFormat.ISO_8601_SIMPLE);
    return LocalDateTime.parse(dateTimeString, formatter);
  }

  /** 使用自定义模式解析 */
  public static LocalDateTime parse(String dateTimeString, String pattern) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
    return LocalDateTime.parse(dateTimeString, formatter);
  }

  /** 检查是否在另一时间之前 */
  public static boolean isBefore(LocalDateTime dateTime1, LocalDateTime dateTime2) {
    return dateTime1.isBefore(dateTime2);
  }

  /** 检查是否在另一时间之后 */
  public static boolean isAfter(LocalDateTime dateTime1, LocalDateTime dateTime2) {
    return dateTime1.isAfter(dateTime2);
  }

  /** 检查是否相等 */
  public static boolean isEqual(LocalDateTime dateTime1, LocalDateTime dateTime2) {
    return dateTime1.isEqual(dateTime2);
  }

  /** 检查是否在时间范围内 */
  public static boolean isBetween(LocalDateTime dateTime, LocalDateTime start, LocalDateTime end) {
    return !dateTime.isBefore(start) && !dateTime.isAfter(end);
  }

  /** 检查是否为今天 */
  public static boolean isToday(LocalDateTime localDateTime) {
    return localDateTime.toLocalDate().equals(LocalDateTime.now().toLocalDate());
  }

  /** 检查是否为同一天 */
  public static boolean isSameDay(LocalDateTime dateTime1, LocalDateTime dateTime2) {
    return dateTime1.toLocalDate().equals(dateTime2.toLocalDate());
  }

  /** 添加天数 */
  public static LocalDateTime plusDays(LocalDateTime localDateTime, long days) {
    return localDateTime.plusDays(days);
  }

  /** 添加小时 */
  public static LocalDateTime plusHours(LocalDateTime localDateTime, long hours) {
    return localDateTime.plusHours(hours);
  }

  /** 添加分钟 */
  public static LocalDateTime plusMinutes(LocalDateTime localDateTime, long minutes) {
    return localDateTime.plusMinutes(minutes);
  }

  /** 添加秒 */
  public static LocalDateTime plusSeconds(LocalDateTime localDateTime, long seconds) {
    return localDateTime.plusSeconds(seconds);
  }

  /** 减去天数 */
  public static LocalDateTime minusDays(LocalDateTime localDateTime, long days) {
    return localDateTime.minusDays(days);
  }

  /** 减去小时 */
  public static LocalDateTime minusHours(LocalDateTime localDateTime, long hours) {
    return localDateTime.minusHours(hours);
  }

  /** 减去分钟 */
  public static LocalDateTime minusMinutes(LocalDateTime localDateTime, long minutes) {
    return localDateTime.minusMinutes(minutes);
  }

  /** 减去秒 */
  public static LocalDateTime minusSeconds(LocalDateTime localDateTime, long seconds) {
    return localDateTime.minusSeconds(seconds);
  }

  /** 获取当天的开始时间 */
  public static LocalDateTime startOfDay(LocalDateTime localDateTime) {
    return localDateTime.toLocalDate().atStartOfDay();
  }

  /** 获取当天的结束时间 */
  public static LocalDateTime endOfDay(LocalDateTime localDateTime) {
    return localDateTime.toLocalDate().atTime(23, 59, 59, 999999999);
  }

  /** 获取本周的开始时间（周一） */
  public static LocalDateTime startOfWeek(LocalDateTime localDateTime) {
    return localDateTime
        .with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
        .toLocalDate()
        .atStartOfDay();
  }

  /** 获取本周的结束时间（周日） */
  public static LocalDateTime endOfWeek(LocalDateTime localDateTime) {
    return localDateTime
        .with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY))
        .toLocalDate()
        .atTime(23, 59, 59, 999999999);
  }

  /** 获取当月的开始时间 */
  public static LocalDateTime startOfMonth(LocalDateTime localDateTime) {
    return localDateTime.with(TemporalAdjusters.firstDayOfMonth()).toLocalDate().atStartOfDay();
  }

  /** 获取当月的结束时间 */
  public static LocalDateTime endOfMonth(LocalDateTime localDateTime) {
    return localDateTime
        .with(TemporalAdjusters.lastDayOfMonth())
        .toLocalDate()
        .atTime(23, 59, 59, 999999999);
  }

  /** 计算两个时间之间的持续时间 */
  public static Duration between(LocalDateTime startInclusive, LocalDateTime endExclusive) {
    return Duration.between(startInclusive, endExclusive);
  }

  /** 计算两个时间之间的毫秒数 */
  public static long betweenMillis(LocalDateTime startInclusive, LocalDateTime endExclusive) {
    return Duration.between(startInclusive, endExclusive).toMillis();
  }

  /** 计算两个时间之间的秒数 */
  public static long betweenSeconds(LocalDateTime startInclusive, LocalDateTime endExclusive) {
    return Duration.between(startInclusive, endExclusive).getSeconds();
  }
}
