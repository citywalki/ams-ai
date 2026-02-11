package pro.walkin.ams.common.exception;

/** 认证相关异常 */
public class AuthException extends RuntimeException {

  public AuthException(String message) {
    super(message);
  }

  public AuthException(String message, Throwable cause) {
    super(message, cause);
  }
}
