package pro.walkin.ams.common.dto;

/**
 * 权限传输对象
 */
public class PermissionDto {
    private String code;
    private String name;
    private String description;
  private Long menuId;
  private Integer sortOrder;
  private String buttonType;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

  public Long getMenuId() {
    return menuId;
  }

  public void setMenuId(Long menuId) {
    this.menuId = menuId;
  }

  public Integer getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(Integer sortOrder) {
    this.sortOrder = sortOrder;
  }

  public String getButtonType() {
    return buttonType;
  }

  public void setButtonType(String buttonType) {
    this.buttonType = buttonType;
  }
}