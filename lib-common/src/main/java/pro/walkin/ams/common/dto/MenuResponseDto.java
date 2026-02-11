package pro.walkin.ams.common.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** 菜单响应数据传输对象 */
public record MenuResponseDto(
    /*
     * 菜单ID
     */
    Long id,

    /*
     * 菜单标识符
     */
    String key,

    /*
     * 菜单显示标签
     */
    String label,

    /*
     * 菜单路由路径
     */
    String route,

    /*
     * 父菜单ID
     */
    Long parentId,

    /*
     * 图标
     */
    String icon,

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
    Map<String, Object> metadata,

    /*
     * 租户ID
     */
    Long tenant,

    /*
     * 创建时间
     */
    LocalDateTime createdAt,

    /*
     * 更新时间
     */
    LocalDateTime updatedAt,

    /*
     * 子菜单列表
     */
    List<MenuResponseDto> children) {
  public MenuResponseDto {
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
    if (children == null) {
      children = new ArrayList<>();
    }
  }
}
