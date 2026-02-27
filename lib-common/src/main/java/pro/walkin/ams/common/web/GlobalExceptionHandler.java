package pro.walkin.ams.common.web;

import jakarta.annotation.Priority;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.Constants;
import pro.walkin.ams.common.dto.ErrorResponse;
import pro.walkin.ams.common.exception.BaseException;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.exception.ValidationException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * 全局异常处理器
 *
 * <p>使用JAX-RS的ExceptionMapper处理全局异常，返回统一的错误响应。 异常处理优先级： 1. ValidationException（自定义验证异常） 2.
 * ConstraintViolationException（Bean Validation异常） 3. NotFoundException（资源未找到） 4.
 * BusinessException（业务异常） 5. BaseException（其他基础异常） 6. WebApplicationException（JAX-RS异常） 7.
 * IllegalArgumentException（非法参数异常） 8. 其他未捕获异常
 */
@Provider
@Priority(1)
public class GlobalExceptionHandler implements ExceptionMapper<Throwable> {

  private static final Logger LOG = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @Override
  public Response toResponse(Throwable throwable) {
    if (throwable instanceof ValidationException) {
      return handleValidationException((ValidationException) throwable);
    } else if (throwable instanceof ConstraintViolationException) {
      return handleConstraintViolationException((ConstraintViolationException) throwable);
    } else if (throwable instanceof NotFoundException) {
      return handleNotFoundException((NotFoundException) throwable);
    } else if (throwable instanceof BusinessException) {
      return handleBusinessException((BusinessException) throwable);
    } else if (throwable instanceof BaseException) {
      return handleBaseException((BaseException) throwable);
    } else if (throwable instanceof WebApplicationException) {
      return handleWebApplicationException((WebApplicationException) throwable);
    } else if (throwable instanceof IllegalArgumentException) {
      return handleIllegalArgumentException((IllegalArgumentException) throwable);
    } else {
      return handleGenericException(throwable);
    }
  }

  /** 处理自定义验证异常 */
  private Response handleValidationException(ValidationException ex) {
    LOG.debug("Validation exception: {}", ex.getMessage());

    List<ErrorResponse.FieldError> fieldErrors = new ArrayList<>();
    if (ex.getField() != null) {
      fieldErrors.add(new ErrorResponse.FieldError(ex.getField(), ex.getMessage(), ex.getValue()));
    }

    ErrorResponse error = ErrorResponse.validationError(ex.getMessage(), fieldErrors);
    return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
  }

  /** 处理Bean Validation异常（ConstraintViolationException） */
  private Response handleConstraintViolationException(ConstraintViolationException ex) {
    LOG.debug("Constraint violation exception: {}", ex.getMessage());

    Set<ConstraintViolation<?>> violations = ex.getConstraintViolations();
    List<ErrorResponse.FieldError> fieldErrors = new ArrayList<>(violations.size());

    for (ConstraintViolation<?> violation : violations) {
      String field = violation.getPropertyPath().toString();
      String message = violation.getMessage();
      Object rejectedValue = violation.getInvalidValue();
      fieldErrors.add(new ErrorResponse.FieldError(field, message, rejectedValue));
    }

    String errorMessage = "请求参数验证失败";
    ErrorResponse error = ErrorResponse.validationError(errorMessage, fieldErrors);
    return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
  }

  /** 处理资源未找到异常 */
  private Response handleNotFoundException(NotFoundException ex) {
    LOG.debug("Resource not found: {}", ex.getMessage());

    ErrorResponse error = ErrorResponse.notFound(ex.getMessage());
    return Response.status(Response.Status.NOT_FOUND).entity(error).build();
  }

  /** 处理业务异常 */
  private Response handleBusinessException(BusinessException ex) {
    LOG.debug("Business exception: {}", ex.getMessage());

    ErrorResponse error = ErrorResponse.businessError(ex.getMessage());
    return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
  }

  /** 处理其他基础异常（BaseException子类） */
  private Response handleBaseException(BaseException ex) {
    LOG.debug("Base exception: {}", ex.getMessage());

    String code = ex.getCode() != null ? ex.getCode() : Constants.ErrorCode.INTERNAL_ERROR;
    ErrorResponse error = new ErrorResponse(code, ex.getMessage(), Instant.now(), null, null);

    // 根据错误码决定HTTP状态码
    Response.Status status = determineHttpStatus(code);
    return Response.status(status).entity(error).build();
  }

  /** 处理JAX-RS WebApplicationException */
  private Response handleWebApplicationException(WebApplicationException ex) {
    LOG.debug("Web application exception: {}", ex.getMessage());

    Response.Status status = Response.Status.fromStatusCode(ex.getResponse().getStatus());
    String code = determineErrorCode(status);
    ErrorResponse error = new ErrorResponse(code, ex.getMessage(), Instant.now(), null, null);

    return Response.status(status).entity(error).build();
  }

  /** 处理其他未捕获异常 */
  private Response handleGenericException(Throwable ex) {
    LOG.error("Unhandled exception: {}", ex.getMessage(), ex);

    // 生产环境中不应该暴露内部错误详情
    String message = "内部服务器错误，请稍后重试";
    ErrorResponse error = ErrorResponse.internalError(message);

    return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(error).build();
  }

  /** 处理非法参数异常 */
  private Response handleIllegalArgumentException(IllegalArgumentException ex) {
    LOG.debug("Illegal argument exception: {}", ex.getMessage());

    ErrorResponse error = ErrorResponse.badRequest(ex.getMessage());
    return Response.status(Response.Status.BAD_REQUEST).entity(error).build();
  }

  /** 根据错误码确定HTTP状态码 */
  private Response.Status determineHttpStatus(String errorCode) {
    return switch (errorCode) {
      case Constants.ErrorCode.UNAUTHORIZED -> Response.Status.UNAUTHORIZED;
      case Constants.ErrorCode.FORBIDDEN -> Response.Status.FORBIDDEN;
      case Constants.ErrorCode.NOT_FOUND -> Response.Status.NOT_FOUND;
      case Constants.ErrorCode.VALIDATION_ERROR,
          Constants.ErrorCode.BUSINESS_ERROR,
          Constants.ErrorCode.BAD_REQUEST ->
          Response.Status.BAD_REQUEST;
      case Constants.ErrorCode.METHOD_NOT_ALLOWED -> Response.Status.METHOD_NOT_ALLOWED;
      case Constants.ErrorCode.UNSUPPORTED_MEDIA_TYPE -> Response.Status.UNSUPPORTED_MEDIA_TYPE;
      default -> Response.Status.INTERNAL_SERVER_ERROR;
    };
  }

  /** 根据HTTP状态码确定错误码 */
  private String determineErrorCode(Response.Status status) {
    return switch (status.getStatusCode()) {
      case 400 -> Constants.ErrorCode.BAD_REQUEST;
      case 401 -> Constants.ErrorCode.UNAUTHORIZED;
      case 403 -> Constants.ErrorCode.FORBIDDEN;
      case 404 -> Constants.ErrorCode.NOT_FOUND;
      case 405 -> Constants.ErrorCode.METHOD_NOT_ALLOWED;
      case 415 -> Constants.ErrorCode.UNSUPPORTED_MEDIA_TYPE;
      default -> Constants.ErrorCode.INTERNAL_ERROR;
    };
  }
}
