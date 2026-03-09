package pro.walkin.ams.admin.system.command.dict.item;

import io.iamcyw.tower.messaging.Command;

public record DeleteDictItemCommand(Long id, Long tenantId) implements Command {}
