package pro.walkin.ams.admin.system;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import pro.walkin.ams.common.dto.UserDto;
import pro.walkin.ams.common.dto.UserResponseDto;
import pro.walkin.ams.common.dto.UserUpdateDto;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.Role;
import pro.walkin.ams.persistence.entity.system.User;
import pro.walkin.ams.security.PasswordService;
import pro.walkin.ams.security.TenantContext;

@ApplicationScoped
public class UserService {

    @Inject
    User.Repo userRepo;

    @Inject
    Role.Repo roleRepo;

    @Inject
    PasswordService passwordService;

    public List<UserResponseDto> findAll(String username, String email, String status, String sortBy, String sortOrder, int page, int size) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return List.of();
        }

        List<User> users = userRepo.findByFilters(tenantId, username, email, status, sortBy, sortOrder, page, size);
        return users.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public long count(String username, String email, String status) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            return 0;
        }
        return userRepo.countByFilters(tenantId, username, email, status);
    }

    public UserResponseDto findById(Long id) {
        User user = userRepo.findByIdOptional(id)
            .orElseThrow(() -> new NotFoundException("用户不存在"));
        return toResponse(user);
    }

    @Transactional
    public UserResponseDto create(UserDto request) {
        Long tenantId = TenantContext.getCurrentTenantId();
        if (tenantId == null) {
            throw new BusinessException("租户信息缺失");
        }

        if (userRepo.findByUsername(request.getUsername()).isPresent()) {
            throw new BusinessException("用户名已存在");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (userRepo.findByEmail(request.getEmail()).isPresent()) {
                throw new BusinessException("邮箱已被使用");
            }
        }

        User user = new User();
        user.username = request.getUsername();
        user.email = request.getEmail();
        user.passwordHash = passwordService.hashPassword(request.getPassword());
        user.status = request.getStatus();
        user.tenant = tenantId;

        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (Long roleId : request.getRoleIds()) {
                Role role = roleRepo.findByIdOptional(roleId)
                    .orElseThrow(() -> new NotFoundException("角色不存在: " + roleId));
                roles.add(role);
            }
            user.roles = roles;
        }

        userRepo.persist(user);
        return toResponse(user);
    }

    @Transactional
    public UserResponseDto update(Long id, UserUpdateDto request) {
        User user = userRepo.findByIdOptional(id)
            .orElseThrow(() -> new NotFoundException("用户不存在"));

        if (request.getUsername() != null && !request.getUsername().equals(user.username)) {
            if (userRepo.findByUsername(request.getUsername()).isPresent()) {
                throw new BusinessException("用户名已存在");
            }
            user.username = request.getUsername();
        }

        if (request.getEmail() != null) {
            if (!request.getEmail().equals(user.email)) {
                if (request.getEmail() != null && !request.getEmail().isBlank()) {
                    if (userRepo.findByEmail(request.getEmail()).isPresent()) {
                        throw new BusinessException("邮箱已被使用");
                    }
                }
            }
            user.email = request.getEmail();
        }

        if (request.getStatus() != null) {
            user.status = request.getStatus();
        }

        if (request.getRoleIds() != null) {
            Set<Role> roles = new HashSet<>();
            for (Long roleId : request.getRoleIds()) {
                Role role = roleRepo.findByIdOptional(roleId)
                    .orElseThrow(() -> new NotFoundException("角色不存在: " + roleId));
                roles.add(role);
            }
            user.roles = roles;
        }

        return toResponse(user);
    }

    @Transactional
    public void delete(Long id) {
        User user = userRepo.findByIdOptional(id)
            .orElseThrow(() -> new NotFoundException("用户不存在"));
        userRepo.delete(user);
    }

    @Transactional
    public void updateStatus(Long id, String status) {
        User user = userRepo.findByIdOptional(id)
            .orElseThrow(() -> new NotFoundException("用户不存在"));
        user.status = status;
    }

    @Transactional
    public void resetPassword(Long id, String newPassword) {
        User user = userRepo.findByIdOptional(id)
            .orElseThrow(() -> new NotFoundException("用户不存在"));
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

        List<UserResponseDto.RoleInfo> roleInfos = user.roles.stream()
            .map(role -> {
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
