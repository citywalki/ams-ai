package pro.walkin.ams.admin.system.command.role;

import io.iamcyw.tower.messaging.Command;

public record AssignUserToRoleCommand(Long roleId, Long userId) implements Command {}
