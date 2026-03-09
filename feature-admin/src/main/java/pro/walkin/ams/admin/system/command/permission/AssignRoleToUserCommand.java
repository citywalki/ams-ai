package pro.walkin.ams.admin.system.command.permission;

import io.iamcyw.tower.messaging.Command;

public record AssignRoleToUserCommand(Long userId, Long roleId) implements Command {}
