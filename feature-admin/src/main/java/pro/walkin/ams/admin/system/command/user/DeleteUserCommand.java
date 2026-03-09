package pro.walkin.ams.admin.system.command.user;

import io.iamcyw.tower.messaging.Command;

public record DeleteUserCommand(Long id) implements Command {}
