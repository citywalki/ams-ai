package pro.walkin.ams.admin.system.command.user;

import io.iamcyw.tower.messaging.Command;

public record UpdateUserStatusCommand(Long id, String status) implements Command {}
