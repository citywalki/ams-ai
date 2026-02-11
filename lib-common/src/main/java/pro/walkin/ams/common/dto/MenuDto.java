package pro.walkin.ams.common.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** 菜单数据传输对象（用于创建和更新） */
public record MenuDto(
    /*
     * 菜单标识符
     */
    @NotBlank(message = "菜单标识符不能为空") @Size(max = 64, message = "菜单标识符长度不能超过64个字符") String key,

    /*
     * 菜单显示标签
     */
    @NotBlank(message = "菜单标签不能为空") @Size(max = 100, message = "菜单标签长度不能超过100个字符") String label,

    /*
     * 菜单路由路径
     */
    @Size(max = 200, message = "菜单路由路径长度不能超过200个字符") String route,

    /*
     * 父菜单ID
     */
    Long parentId,

    /*
     * 图标
     */
    @Size(max = 50, message = "图标长度不能超过50个字符") String icon,

    /*
     * 排序序号
     */
    Integer sortOrder,

    /*
     * 是否可见
     */
    Boolean isVisible,

    /*
     * 允许访问的角色列表
     */
    List<String> rolesAllowed,

    /*
     * 元数据
     */
    Map<String, Object> metadata) {
  public MenuDto {
    // 提供默认值
    if (sortOrder == null) {
      sortOrder = 0;
    }
    if (isVisible == null) {
      isVisible = true;
    }
    if (rolesAllowed == null) {
      rolesAllowed = new ArrayList<>();
    }
    if (metadata == null) {
      metadata = new HashMap<>();
    }
  }
}
