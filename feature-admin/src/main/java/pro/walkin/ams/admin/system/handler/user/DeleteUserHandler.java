package pro.walkin.ams.admin.system.handler.user;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.system.command.user.DeleteUserCommand;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.User;

@ApplicationScoped
public class DeleteUserHandler implements CommandHandler<DeleteUserCommand, Void> {

  @Inject User.Repo userRepo;

  @Override
  @Transactional
  public Void handle(DeleteUserCommand cmd) {
    User user =
        userRepo.findByIdOptional(cmd.id()).orElseThrow(() -> new NotFoundException("用户不存在"));
    userRepo.delete(user);
    return null;
  }
}
