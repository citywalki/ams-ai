package pro.walkin.ams.admin.system.command.permission;

import io.iamcyw.tower.messaging.Command;

public record GrantPermissionToRoleCommand(Long roleId, Long permissionId) implements Command {}
