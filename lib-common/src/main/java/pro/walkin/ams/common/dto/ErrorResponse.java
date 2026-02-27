package pro.walkin.ams.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import pro.walkin.ams.common.Constants;

import java.time.Instant;
import java.util.List;

/**
 * 统一的错误响应DTO
 *
 * <p>用于全局异常处理器返回统一的错误响应格式。
 *
 * @param code 错误码，参考 Constants.ErrorCode
 * @param message 错误消息
 * @param timestamp 错误发生时间戳
 * @param fieldErrors 字段级错误详情，适用于验证异常
 * @param requestId 请求ID，用于跟踪
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
    String code,
    String message,
    Instant timestamp,
    List<FieldError> fieldErrors,
    String requestId) {

  public ErrorResponse(String code, String message) {
    this(code, message, Instant.now(), null, null);
  }

  public ErrorResponse(String code, String message, Instant timestamp) {
    this(code, message, timestamp, null, null);
  }

  public ErrorResponse(String code, String message, List<FieldError> fieldErrors) {
    this(
        code,
        message,
        Instant.now(),
        fieldErrors != null && !fieldErrors.isEmpty() ? fieldErrors : null,
        null);
  }

  public ErrorResponse(
      String code,
      String message,
      Instant timestamp,
      List<FieldError> fieldErrors,
      String requestId) {
    this.code = code;
    this.message = message;
    this.timestamp = timestamp;
    this.fieldErrors = fieldErrors != null && !fieldErrors.isEmpty() ? fieldErrors : null;
    this.requestId = requestId;
  }

  /** 字段级错误详情 */
  @JsonInclude(JsonInclude.Include.NON_NULL)
  public record FieldError(String field, String message, Object rejectedValue) {}

  /** 构建一个内部服务器错误响应 */
  public static ErrorResponse internalError(String message) {
    return new ErrorResponse(Constants.ErrorCode.INTERNAL_ERROR, message);
  }

  /** 构建一个验证错误响应 */
  public static ErrorResponse validationError(String message, List<FieldError> fieldErrors) {
    return new ErrorResponse(Constants.ErrorCode.VALIDATION_ERROR, message, fieldErrors);
  }

  /** 构建一个业务错误响应 */
  public static ErrorResponse businessError(String message) {
    return new ErrorResponse(Constants.ErrorCode.BUSINESS_ERROR, message);
  }

  /** 构建一个资源未找到错误响应 */
  public static ErrorResponse notFound(String message) {
    return new ErrorResponse(Constants.ErrorCode.NOT_FOUND, message);
  }

  /** 构建一个未授权错误响应 */
  public static ErrorResponse unauthorized(String message) {
    return new ErrorResponse(Constants.ErrorCode.UNAUTHORIZED, message);
  }

  /** 构建一个禁止访问错误响应 */
  public static ErrorResponse forbidden(String message) {
    return new ErrorResponse(Constants.ErrorCode.FORBIDDEN, message);
  }

  /** 构建一个错误请求响应 */
  public static ErrorResponse badRequest(String message) {
    return new ErrorResponse(Constants.ErrorCode.BAD_REQUEST, message);
  }
}
