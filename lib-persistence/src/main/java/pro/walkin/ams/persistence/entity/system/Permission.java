package pro.walkin.ams.persistence.entity.system;

import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.processing.Find;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 权限实体
 *
 * <p>对应数据库表: permissions
 *
 * <p>权限码命名规范: {菜单code}:{操作} 例如: alerts:create, alerts:delete, users:edit
 */
@Entity
@Table(name = "permissions")
@Filter(name = "tenant-filter")
public class Permission extends BaseEntity {

  /*
   * 权限码，例如: alerts:create, users:delete, menus:edit
   */
  @Column(name = "code", nullable = false, unique = true)
  public String code;

  /*
   * 权限名称
   */
  @Column(name = "name", nullable = false)
  public String name;

  /*
   * 权限描述
   */
  @Column(name = "description")
  public String description;

  /*
   * 所属菜单（按钮权限挂在菜单下）
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "menu_id")
  public Menu menu;

  /*
   * 排序顺序（在菜单中的显示顺序）
   */
  @Column(name = "sort_order")
  public Integer sortOrder;

  /*
   * 按钮类型：PRIMARY（主要）, DEFAULT（默认）, DANGER（危险）
   */
  @Column(name = "button_type")
  public String buttonType;

  /*
   * 创建时间
   */
  @Column(name = "created_at")
  @CreationTimestamp
  public LocalDateTime createdAt;

  /*
   * 更新时间
   */
  @Column(name = "updated_at")
  @UpdateTimestamp
  public LocalDateTime updatedAt;

  public interface Repo extends PanacheRepository<Permission> {

    @Find
    Optional<Permission> findByCode(String code);

    default List<Permission> listByMenuId(Long menuId) {
      return list("menu.id", menuId);
    }

    default List<Permission> listByTenant(
        Long tenantId, String sortBy, String sortOrder, int page, int size) {
      String sortField = mapSortField(sortBy);
      String direction = "DESC".equalsIgnoreCase(sortOrder) ? "DESC" : "ASC";
      return find("tenant = ?1 order by " + sortField + " " + direction, tenantId)
          .page(page, size)
          .list();
    }

    default String mapSortField(String sortBy) {
      if (sortBy == null) {
        return "createdAt";
      }
      return switch (sortBy) {
        case "code" -> "code";
        case "name" -> "name";
        case "createdAt" -> "createdAt";
        case "updatedAt" -> "updatedAt";
        default -> "createdAt";
      };
    }

    default long countByTenant(Long tenantId) {
      return count("tenant", tenantId);
    }
  }
}
