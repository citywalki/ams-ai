package pro.walkin.ams.admin.system.command.role;

import io.iamcyw.tower.messaging.Command;

public record RemoveUserFromRoleCommand(Long roleId, Long userId) implements Command {}
