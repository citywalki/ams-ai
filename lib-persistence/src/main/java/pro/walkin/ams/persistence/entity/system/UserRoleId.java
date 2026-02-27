package pro.walkin.ams.persistence.entity.system;

import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class UserRoleId implements Serializable {

  public Long userId;

  public Long roleId;

  public UserRoleId() {}

  public UserRoleId(Long userId, Long roleId) {
    this.userId = userId;
    this.roleId = roleId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    UserRoleId that = (UserRoleId) o;
    return Objects.equals(userId, that.userId) && Objects.equals(roleId, that.roleId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(userId, roleId);
  }
}
