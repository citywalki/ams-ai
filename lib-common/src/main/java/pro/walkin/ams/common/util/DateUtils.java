package pro.walkin.ams.common.util;

import pro.walkin.ams.common.Constants;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;

/**
 * 日期时间工具类
 */
public class DateUtils {
    
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
    
    private DateUtils() {
        // 工具类，防止实例化
    }
    
    public static Instant now() {
        return Instant.now();
    }
    
    public static ZonedDateTime nowUtc() {
        return ZonedDateTime.now(UTC_ZONE);
    }
    
    public static LocalDateTime nowLocal() {
        return LocalDateTime.now();
    }
    
    public static Instant toInstant(LocalDateTime localDateTime) {
        return localDateTime.atZone(DEFAULT_ZONE).toInstant();
    }
    
    public static LocalDateTime toLocalDateTime(Instant instant) {
        return LocalDateTime.ofInstant(instant, DEFAULT_ZONE);
    }
    
    public static String toUtcString(Instant instant) {
        return ISO_FORMATTER.format(instant.atZone(UTC_ZONE));
    }
    
    public static Instant fromUtcString(String utcString) {
        return ZonedDateTime.parse(utcString, ISO_FORMATTER).toInstant();
    }
    
    public static String format(Instant instant, String pattern) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return formatter.format(instant.atZone(DEFAULT_ZONE));
    }
    
    public static String format(Instant instant, DateTimeFormatter formatter) {
        return formatter.format(instant.atZone(DEFAULT_ZONE));
    }
    
    public static Instant parse(String dateString, String pattern) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        LocalDateTime localDateTime = LocalDateTime.parse(dateString, formatter);
        return toInstant(localDateTime);
    }
    
    public static Instant parse(String dateString, DateTimeFormatter formatter) {
        LocalDateTime localDateTime = LocalDateTime.parse(dateString, formatter);
        return toInstant(localDateTime);
    }
    
    public static boolean isToday(Instant instant) {
        LocalDate today = LocalDate.now();
        LocalDate date = toLocalDateTime(instant).toLocalDate();
        return today.equals(date);
    }
    
    public static boolean isSameDay(Instant date1, Instant date2) {
        LocalDate localDate1 = toLocalDateTime(date1).toLocalDate();
        LocalDate localDate2 = toLocalDateTime(date2).toLocalDate();
        return localDate1.equals(localDate2);
    }
    
    public static Instant addDays(Instant instant, long days) {
        return instant.plusSeconds(days * 24 * 3600);
    }
    
    public static Instant addHours(Instant instant, long hours) {
        return instant.plusSeconds(hours * 3600);
    }
    
    public static Instant addMinutes(Instant instant, long minutes) {
        return instant.plusSeconds(minutes * 60);
    }
    
    public static Instant getStartOfDay(Instant instant) {
        LocalDate localDate = toLocalDateTime(instant).toLocalDate();
        LocalDateTime startOfDay = localDate.atStartOfDay();
        return toInstant(startOfDay);
    }
    
    public static Instant getEndOfDay(Instant instant) {
        LocalDate localDate = toLocalDateTime(instant).toLocalDate();
        LocalDateTime endOfDay = localDate.atTime(23, 59, 59, 999999999);
        return toInstant(endOfDay);
    }
}