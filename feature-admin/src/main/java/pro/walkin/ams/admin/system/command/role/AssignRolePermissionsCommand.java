package pro.walkin.ams.admin.system.command.role;

import io.iamcyw.tower.messaging.Command;

import java.util.List;

public record AssignRolePermissionsCommand(Long roleId, List<Long> permissionIds)
    implements Command {}
