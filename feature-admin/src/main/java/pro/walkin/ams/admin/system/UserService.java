package pro.walkin.ams.admin.system;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.auth.service.PasswordService;
import pro.walkin.ams.admin.system.query.UserQuery;
import pro.walkin.ams.common.dto.UserDto;
import pro.walkin.ams.common.dto.UserResponseDto;
import pro.walkin.ams.common.dto.UserUpdateDto;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class UserService {

  @Inject User.Repo userRepo;

  @Inject Role.Repo roleRepo;

  @Inject PasswordService passwordService;

  @Inject UserQuery userQuery;

  public List<UserResponseDto> findAll(
      String username,
      String email,
      String status,
      String sortBy,
      String sortOrder,
      int page,
      int size) {
    Long tenantId = TenantContext.getCurrentTenantId();
    if (tenantId == null) {
      return List.of();
    }

    List<User> users =
        userQuery.findByFilters(tenantId, username, email, status, sortBy, sortOrder, page, size);
    return users.stream().map(this::toResponse).collect(Collectors.toList());
  }

  public long count(String username, String email, String status) {
    Long tenantId = TenantContext.getCurrentTenantId();
    if (tenantId == null) {
      return 0;
    }
    return userQuery.countByFilters(tenantId, username, email, status);
  }

  public UserResponseDto findById(Long id) {
    User user = userQuery.findById(id).orElseThrow(() -> new NotFoundException("用户不存在"));
    return toResponse(user);
  }

  @Transactional
  public UserResponseDto create(UserDto request) {
    Long tenantId = TenantContext.getCurrentTenantId();
    if (tenantId == null) {
      throw new BusinessException("租户信息缺失");
    }

    if (userQuery.findByUsername(request.getUsername()).isPresent()) {
      throw new BusinessException("用户名已存在");
    }

    if (request.getEmail() != null && !request.getEmail().isBlank()) {
      if (userQuery.findByEmail(request.getEmail()).isPresent()) {
        throw new BusinessException("邮箱已被使用");
      }
    }

    User user = new User();
    user.username = request.getUsername();
    user.email = request.getEmail();
    user.passwordHash = passwordService.hashPassword(request.getPassword());
    user.status = request.getStatus();
    user.tenant = tenantId;

    userRepo.persist(user);
    userRepo.flush();
    return toResponse(user);
  }

  @Transactional
  public UserResponseDto update(Long id, UserUpdateDto request) {
    User user = userRepo.findByIdOptional(id).orElseThrow(() -> new NotFoundException("用户不存在"));

    if (request.getUsername() != null && !request.getUsername().equals(user.username)) {
      if (userQuery.findByUsername(request.getUsername()).isPresent()) {
        throw new BusinessException("用户名已存在");
      }
      user.username = request.getUsername();
    }

    if (request.getEmail() != null) {
      if (!request.getEmail().equals(user.email)) {
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
          if (userQuery.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessException("邮箱已被使用");
          }
        }
      }
      user.email = request.getEmail();
    }

    if (request.getStatus() != null) {
      user.status = request.getStatus();
    }

    return toResponse(user);
  }

  @Transactional
  public void delete(Long id) {
    User user = userRepo.findByIdOptional(id).orElseThrow(() -> new NotFoundException("用户不存在"));
    userRepo.delete(user);
  }

  @Transactional
  public void updateStatus(Long id, String status) {
    User user = userRepo.findByIdOptional(id).orElseThrow(() -> new NotFoundException("用户不存在"));
    user.status = status;
  }

  @Transactional
  public void resetPassword(Long id, String newPassword) {
    User user = userRepo.findByIdOptional(id).orElseThrow(() -> new NotFoundException("用户不存在"));
    user.passwordHash = passwordService.hashPassword(newPassword);
  }

  private UserResponseDto toResponse(User user) {
    UserResponseDto response = new UserResponseDto();
    response.setId(user.id);
    response.setUsername(user.username);
    response.setEmail(user.email);
    response.setStatus(user.status);
    response.setCreatedAt(user.createdAt);
    response.setUpdatedAt(user.updatedAt);

    List<UserResponseDto.RoleInfo> roleInfos =
        user.roles.stream()
            .map(
                role -> {
                  UserResponseDto.RoleInfo info = new UserResponseDto.RoleInfo();
                  info.setId(role.id);
                  info.setCode(role.code);
                  info.setName(role.name);
                  return info;
                })
            .collect(Collectors.toList());
    response.setRoles(roleInfos);

    return response;
  }
}
