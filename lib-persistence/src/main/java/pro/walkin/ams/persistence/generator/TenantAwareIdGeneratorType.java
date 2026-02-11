package pro.walkin.ams.persistence.generator;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.hibernate.annotations.IdGeneratorType;

/** 租户感知的 ID 生成器注解 使用 @IdGeneratorType 元注解，符合 Hibernate 6.5+ 最佳实践 */
@IdGeneratorType(TenantAwareIdGenerator.class)
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.FIELD, ElementType.METHOD})
public @interface TenantAwareIdGeneratorType {
  // 可选的配置参数
  String name() default "tenantAwareIdGenerator";
}
