package pro.walkin.ams.persistence.generator;

import org.hibernate.annotations.IdGeneratorType;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/** Snowflake ID 生成器注解，符合 Hibernate 6.5+ 标准 使用 @IdGeneratorType 元注解，替代旧版 @GenericGenerator 方式 */
@IdGeneratorType(SnowflakeIdGenerator.class)
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD})
public @interface SnowflakeIdGeneratorType {
  // 可选配置参数
  long datacenterId() default 1;

  long machineId() default 1;

  String name() default "";
}
