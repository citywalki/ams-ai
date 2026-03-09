package pro.walkin.ams.admin.system.command.menu;

import io.iamcyw.tower.messaging.Command;

public record DeleteMenuCommand(Long id, Long tenantId) implements Command {}
