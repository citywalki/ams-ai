package pro.walkin.ams.common.security.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 需要多个权限的注解
 *
 * <p>可以指定需要满足的权限组合方式
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermissions {
  String[] value(); // 权限码数组

  // 逻辑运算符：ALL表示需要所有权限，ANY表示需要任一权限
  LogicalOperator operator() default LogicalOperator.ALL;

  enum LogicalOperator {
    ALL, // 需要所有指定的权限
    ANY // 需要任一指定的权限
  }
}
