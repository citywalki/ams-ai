package pro.walkin.ams.common.exception;

/** 资源未找到异常 */
public class NotFoundException extends BaseException {

  private final String resourceType;
  private final String resourceId;

  public NotFoundException(String code, String message, String resourceType, String resourceId) {
    super(code, message);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  public NotFoundException(
      String code, String message, String resourceType, String resourceId, Throwable cause) {
    super(code, message, cause);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  public NotFoundException(String message) {
    super("NOT_FOUND", message);
    this.resourceType = null;
    this.resourceId = null;
  }

  public NotFoundException(String resourceType, String resourceId) {
    super("NOT_FOUND", resourceType + " with id " + resourceId + " not found");
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  public String getResourceType() {
    return resourceType;
  }

  public String getResourceId() {
    return resourceId;
  }
}
