package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.auth.service.PasswordService;
import pro.walkin.ams.admin.system.command.user.CreateUserCommand;
import pro.walkin.ams.admin.system.query.UserQuery;
import pro.walkin.ams.common.dto.UserResponseDto;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class CreateUserHandler implements CommandHandler<CreateUserCommand, UserResponseDto> {

  @Inject User.Repo userRepo;

  @Inject UserQuery userQuery;

  @Inject PasswordService passwordService;

  @Override
  @Transactional
  public UserResponseDto handle(CreateUserCommand cmd) {
    if (userQuery.findByUsername(cmd.username()).isPresent()) {
      throw new BusinessException("用户名已存在");
    }

    if (cmd.email() != null && !cmd.email().isBlank()) {
      if (userQuery.findByEmail(cmd.email()).isPresent()) {
        throw new BusinessException("邮箱已被使用");
      }
    }

    User user = new User();
    user.username = cmd.username();
    user.email = cmd.email();
    user.passwordHash = passwordService.hashPassword(cmd.password());
    user.status = cmd.status();
    user.tenant = cmd.tenantId();

    userRepo.persist(user);
    return toResponse(user);
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
