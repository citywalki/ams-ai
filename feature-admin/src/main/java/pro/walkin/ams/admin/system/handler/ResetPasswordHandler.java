package pro.walkin.ams.admin.system.handler;

import io.iamcyw.tower.messaging.CommandHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import pro.walkin.ams.admin.auth.service.PasswordService;
import pro.walkin.ams.admin.system.command.user.ResetPasswordCommand;
import pro.walkin.ams.common.exception.NotFoundException;
import pro.walkin.ams.persistence.entity.system.User;

@ApplicationScoped
public class ResetPasswordHandler implements CommandHandler<ResetPasswordCommand, Void> {

  @Inject User.Repo userRepo;

  @Inject PasswordService passwordService;

  @Override
  @Transactional
  public Void handle(ResetPasswordCommand cmd) {
    User user =
        userRepo.findByIdOptional(cmd.id()).orElseThrow(() -> new NotFoundException("用户不存在"));
    user.passwordHash = passwordService.hashPassword(cmd.newPassword());
    return null;
  }
}
