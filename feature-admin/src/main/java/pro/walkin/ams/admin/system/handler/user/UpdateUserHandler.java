package pro.walkin.ams.admin.system.handler.user;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.user.UpdateUserCommand;
import pro.walkin.ams.admin.system.query.UserQuery;
import pro.walkin.ams.common.dto.UserResponseDto;
import pro.walkin.ams.common.exception.BusinessException;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.User;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class UpdateUserHandler implements CommandHandler<UpdateUserCommand, UserResponseDto> {

  @Inject User.Repo userRepo;

  @Inject UserQuery userQuery;

  @Override
  @Transactional
  public UserResponseDto handle(UpdateUserCommand cmd) {
    User user =
        userRepo.findByIdOptional(cmd.id()).orElseThrow(() -> new NotFoundException("用户不存在"));

    if (cmd.username() != null && !cmd.username().equals(user.username)) {
      if (userQuery.findByUsername(cmd.username()).isPresent()) {
        throw new BusinessException("用户名已存在");
      }
      user.username = cmd.username();
    }

    if (cmd.email() != null) {
      if (!cmd.email().equals(user.email)) {
        if (userQuery.findByEmail(cmd.email()).isPresent()) {
          throw new BusinessException("邮箱已被使用");
        }
      }
      user.email = cmd.email();
    }

    if (cmd.status() != null) {
      user.status = cmd.status();
    }

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
