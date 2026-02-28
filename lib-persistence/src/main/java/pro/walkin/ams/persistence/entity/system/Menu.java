package pro.walkin.ams.persistence.entity.system;

import io.quarkus.hibernate.panache.PanacheRepository;
import jakarta.persistence.*;
import org.eclipse.microprofile.graphql.Ignore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.processing.Find;
import org.hibernate.type.SqlTypes;
import pro.walkin.ams.persistence.entity.BaseEntity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 菜单实体
 *
 * <p>对应数据库表: menus
 */
@Entity
@Table(name = "menus")
@Filter(name = "tenant-filter")
public class Menu extends BaseEntity {

  public enum MenuType {
    FOLDER,
    MENU
  }

  /*
   * 菜单标识符
   */
  @Column(name = "key", nullable = false)
  public String key;

  /*
   * 菜单显示标签
   */
  @Column(name = "label", nullable = false)
  public String label;

  /*
   * 菜单路由路径
   */
  @Column(name = "route")
  public String route;

  /*
   * 父菜单ID
   */
  @Column(name = "parent_id")
  public Long parentId;

  /*
   * 图标
   */
  @Column(name = "icon")
  public String icon;

  /*
   * 排序序号
   */
  @Column(name = "sort_order")
  public Integer sortOrder = 0;

  /*
   * 是否可见
   */
  @Column(name = "is_visible")
  public Boolean isVisible = true;

  /*
   * 菜单类型
   */
  @Enumerated(EnumType.STRING)
  @Column(name = "menu_type", nullable = false)
  public MenuType menuType = MenuType.MENU;

  /*
   * 允许访问的角色列表 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "roles_allowed")
  public List<String> rolesAllowed = new ArrayList<>();

  /*
   * 元数据 (JSONB)
   */
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(name = "metadata")
  @Ignore
  public Map<String, Object> metadata = new HashMap<>();

  /*
   * 子菜单列表
   */
  @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  @Ignore
  public List<Menu> children = new ArrayList<>();

  /*
   * 父菜单引用
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "parent_id", insertable = false, updatable = false)
  @Ignore
  public Menu parent;

  /*
   * 菜单下的按钮权限列表
   */
  @OneToMany(mappedBy = "menu", fetch = FetchType.LAZY)
  @Ignore
  public List<Permission> buttonPermissions = new ArrayList<>();

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

  public interface Repo extends PanacheRepository<Menu> {

    @Find
    Menu findByKey(String key);

    default Long countByKey(String key) {
      return count("key", key);
    }
  }
}
