package pro.walkin.ams.common.dto;

import jakarta.validation.constraints.NotNull;

/**
 * 分配用户到角色请求传输对象
 */
public class AssignUserToRoleDto {
    @NotNull(message = "用户ID不能为空")
    private Long userId;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
