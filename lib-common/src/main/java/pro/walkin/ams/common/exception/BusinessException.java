package pro.walkin.ams.common.exception;

/** 业务逻辑异常 */
public class BusinessException extends BaseException {

  public BusinessException(String code, String message) {
    super(code, message);
  }

  public BusinessException(String code, String message, Throwable cause) {
    super(code, message, cause);
  }

  public BusinessException(String message) {
    super("BUSINESS_ERROR", message);
  }

  public BusinessException(String message, Throwable cause) {
    super("BUSINESS_ERROR", message, cause);
  }
}
