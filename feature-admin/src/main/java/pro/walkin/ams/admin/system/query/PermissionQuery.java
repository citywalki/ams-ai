package pro.walkin.ams.admin.system.query;

import jakarta.enterprise.context.ApplicationScoped;
import pro.walkin.ams.common.dto.PermissionResponseDto;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.persistence.entity.system.Permission;
import pro.walkin.ams.persistence.entity.system.Permission_;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/** 权限查询类 所有权限相关的查询方法都放在这里 */
@ApplicationScoped
public class PermissionQuery {

  public Optional<Permission> findById(Long id) {
    return Permission_.managedBlocking().findByIdOptional(id);
  }

  public Optional<Permission> findByCode(String code) {
    return Permission_.managedBlocking().find("code", code).firstResultOptional();
  }

  public List<Permission> listByTenant(
      Long tenantId, String sortBy, String sortOrder, int page, int size) {
    String sortField = mapSortField(sortBy);
    String direction = "DESC".equalsIgnoreCase(sortOrder) ? "DESC" : "ASC";
    return Permission_.managedBlocking()
        .find("tenant = ?1 order by " + sortField + " " + direction, tenantId)
        .page(page, size)
        .list();
  }

  public long countByTenant(Long tenantId) {
    return Permission_.managedBlocking().count("tenant", tenantId);
  }

  private String mapSortField(String sortBy) {
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

  // ========== DTO 查询方法 ==========

  public List<PermissionResponseDto> findAllAsDto(
      String sortBy, String sortOrder, int page, int size) {
    Long tenantId = TenantContext.getCurrentTenantId();
    if (tenantId == null) {
      return List.of();
    }
    return listByTenant(tenantId, sortBy, sortOrder, page, size).stream()
        .map(this::toResponseDto)
        .collect(Collectors.toList());
  }

  public long count() {
    Long tenantId = TenantContext.getCurrentTenantId();
    return tenantId == null ? 0 : countByTenant(tenantId);
  }

  public PermissionResponseDto findByIdAsDto(Long id) {
    return findById(id)
        .map(this::toResponseDto)
        .orElseThrow(() -> new NotFoundException("Permission", id.toString()));
  }

  public Optional<PermissionResponseDto> findByCodeAsDto(String code) {
    return findByCode(code).map(this::toResponseDto);
  }

  private PermissionResponseDto toResponseDto(Permission permission) {
    PermissionResponseDto dto = new PermissionResponseDto();
    dto.setId(permission.id);
    dto.setCode(permission.code);
    dto.setName(permission.name);
    dto.setDescription(permission.description);
    dto.setSortOrder(permission.sortOrder);
    dto.setButtonType(permission.buttonType);
    if (permission.menu != null) {
      dto.setMenuId(permission.menu.id);
      dto.setMenuName(permission.menu.label);
    }
    dto.setCreatedAt(permission.createdAt);
    dto.setUpdatedAt(permission.updatedAt);
    return dto;
  }
}
