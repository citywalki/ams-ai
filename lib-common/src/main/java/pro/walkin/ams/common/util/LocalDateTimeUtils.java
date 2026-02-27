package pro.walkin.ams.common.util;

import pro.walkin.ams.common.Constants;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;

public class LocalDateTimeUtils {

  private static final ZoneId DEFAULT_ZONE = ZoneId.systemDefault();

  private LocalDateTimeUtils() {}

  public static LocalDateTime now() {
    return LocalDateTime.now();
  }

  public static ZonedDateTime nowUtc() {
    return ZonedDateTime.now(ZoneId.of("UTC"));
  }

  public static Instant toInstant(LocalDateTime localDateTime) {
    return localDateTime.atZone(DEFAULT_ZONE).toInstant();
  }

  public static LocalDateTime fromInstant(Instant instant) {
    return LocalDateTime.ofInstant(instant, DEFAULT_ZONE);
  }

  public static long toEpochMillis(LocalDateTime localDateTime) {
    return localDateTime.atZone(DEFAULT_ZONE).toInstant().toEpochMilli();
  }

  public static LocalDateTime fromEpochMillis(long epochMillis) {
    return LocalDateTime.ofInstant(Instant.ofEpochMilli(epochMillis), DEFAULT_ZONE);
  }

  public static String format(LocalDateTime localDateTime) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(Constants.DateFormat.ISO_8601_SIMPLE);
    return formatter.format(localDateTime);
  }

  public static String format(LocalDateTime localDateTime, String pattern) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
    return formatter.format(localDateTime);
  }

  public static LocalDateTime parse(String dateTimeString) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(Constants.DateFormat.ISO_8601_SIMPLE);
    return LocalDateTime.parse(dateTimeString, formatter);
  }

  public static LocalDateTime parse(String dateTimeString, String pattern) {
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
    return LocalDateTime.parse(dateTimeString, formatter);
  }

  public static boolean isBefore(LocalDateTime dateTime1, LocalDateTime dateTime2) {
    return dateTime1.isBefore(dateTime2);
  }

  public static boolean isAfter(LocalDateTime dateTime1, LocalDateTime dateTime2) {
    return dateTime1.isAfter(dateTime2);
  }

  public static boolean isEqual(LocalDateTime dateTime1, LocalDateTime dateTime2) {
    return dateTime1.isEqual(dateTime2);
  }

  public static boolean isBetween(LocalDateTime dateTime, LocalDateTime start, LocalDateTime end) {
    return !dateTime.isBefore(start) && !dateTime.isAfter(end);
  }

  public static boolean isToday(LocalDateTime localDateTime) {
    return localDateTime.toLocalDate().equals(LocalDateTime.now().toLocalDate());
  }

  public static boolean isSameDay(LocalDateTime dateTime1, LocalDateTime dateTime2) {
    return dateTime1.toLocalDate().equals(dateTime2.toLocalDate());
  }

  public static LocalDateTime plusDays(LocalDateTime localDateTime, long days) {
    return localDateTime.plusDays(days);
  }

  public static LocalDateTime plusHours(LocalDateTime localDateTime, long hours) {
    return localDateTime.plusHours(hours);
  }

  public static LocalDateTime plusMinutes(LocalDateTime localDateTime, long minutes) {
    return localDateTime.plusMinutes(minutes);
  }

  public static LocalDateTime plusSeconds(LocalDateTime localDateTime, long seconds) {
    return localDateTime.plusSeconds(seconds);
  }

  public static LocalDateTime minusDays(LocalDateTime localDateTime, long days) {
    return localDateTime.minusDays(days);
  }

  public static LocalDateTime minusHours(LocalDateTime localDateTime, long hours) {
    return localDateTime.minusHours(hours);
  }

  public static LocalDateTime minusMinutes(LocalDateTime localDateTime, long minutes) {
    return localDateTime.minusMinutes(minutes);
  }

  public static LocalDateTime minusSeconds(LocalDateTime localDateTime, long seconds) {
    return localDateTime.minusSeconds(seconds);
  }

  public static LocalDateTime startOfDay(LocalDateTime localDateTime) {
    return localDateTime.toLocalDate().atStartOfDay();
  }

  public static LocalDateTime endOfDay(LocalDateTime localDateTime) {
    return localDateTime.toLocalDate().atTime(23, 59, 59, 999999999);
  }

  public static LocalDateTime startOfWeek(LocalDateTime localDateTime) {
    return localDateTime
        .with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
        .toLocalDate()
        .atStartOfDay();
  }

  public static LocalDateTime endOfWeek(LocalDateTime localDateTime) {
    return localDateTime
        .with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY))
        .toLocalDate()
        .atTime(23, 59, 59, 999999999);
  }

  public static LocalDateTime startOfMonth(LocalDateTime localDateTime) {
    return localDateTime.with(TemporalAdjusters.firstDayOfMonth()).toLocalDate().atStartOfDay();
  }

  public static LocalDateTime endOfMonth(LocalDateTime localDateTime) {
    return localDateTime
        .with(TemporalAdjusters.lastDayOfMonth())
        .toLocalDate()
        .atTime(23, 59, 59, 999999999);
  }

  public static Duration between(LocalDateTime startInclusive, LocalDateTime endExclusive) {
    return Duration.between(startInclusive, endExclusive);
  }

  public static long betweenMillis(LocalDateTime startInclusive, LocalDateTime endExclusive) {
    return Duration.between(startInclusive, endExclusive).toMillis();
  }

  public static long betweenSeconds(LocalDateTime startInclusive, LocalDateTime endExclusive) {
    return Duration.between(startInclusive, endExclusive).getSeconds();
  }
}
