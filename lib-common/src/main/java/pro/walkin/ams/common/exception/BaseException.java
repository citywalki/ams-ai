package pro.walkin.ams.common.exception;

/** 基础业务异常类 */
public class BaseException extends RuntimeException {

  private final String code;

  public static final String DEFAULT_ERROR_CODE = "INTERNAL_ERROR";

  public BaseException(String code, String message) {
    super(message);
    this.code = code;
  }

  public BaseException(String code, String message, Throwable cause) {
    super(message, cause);
    this.code = code;
  }

  public BaseException(String message) {
    this(DEFAULT_ERROR_CODE, message);
  }

  public BaseException(String message, Throwable cause) {
    this(DEFAULT_ERROR_CODE, message, cause);
  }

  public String getCode() {
    return code;
  }
}
