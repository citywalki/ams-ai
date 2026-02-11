package pro.walkin.ams.common.exception;

/** 数据验证异常 */
public class ValidationException extends BaseException {

  private final String field;
  private final Object value;

  public ValidationException(String code, String message, String field, Object value) {
    super(code, message);
    this.field = field;
    this.value = value;
  }

  public ValidationException(
      String code, String message, String field, Object value, Throwable cause) {
    super(code, message, cause);
    this.field = field;
    this.value = value;
  }

  public ValidationException(String message) {
    super("VALIDATION_ERROR", message);
    this.field = null;
    this.value = null;
  }

  public ValidationException(String message, String field) {
    super("VALIDATION_ERROR", message);
    this.field = field;
    this.value = null;
  }

  public ValidationException(String message, String field, Object value) {
    super("VALIDATION_ERROR", message);
    this.field = field;
    this.value = value;
  }

  public String getField() {
    return field;
  }

  public Object getValue() {
    return value;
  }
}
