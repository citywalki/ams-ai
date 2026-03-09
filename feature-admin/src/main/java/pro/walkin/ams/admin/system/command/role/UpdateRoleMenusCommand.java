package pro.walkin.ams.admin.system.command.role;

import io.iamcyw.tower.messaging.Command;

import java.util.List;

public record UpdateRoleMenusCommand(Long roleId, List<Long> menuIds, Long tenantId)
    implements Command {}
