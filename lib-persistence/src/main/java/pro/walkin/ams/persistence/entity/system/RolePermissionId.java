package pro.walkin.ams.persistence.entity.system;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class RolePermissionId implements Serializable {

  public Long roleId;

  public Long permissionId;

  public RolePermissionId() {}

  public RolePermissionId(Long roleId, Long permissionId) {
    this.roleId = roleId;
    this.permissionId = permissionId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    RolePermissionId that = (RolePermissionId) o;
    return Objects.equals(roleId, that.roleId) && Objects.equals(permissionId, that.permissionId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(roleId, permissionId);
  }
}
