package pro.walkin.ams.admin.command;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.iamcyw.tower.messaging.Command;
import io.iamcyw.tower.messaging.HandlerRegistry;
import io.iamcyw.tower.messaging.gateway.MessageGateway;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import pro.walkin.ams.common.command.CommandRequest;
import pro.walkin.ams.common.command.CommandResponse;

import java.io.IOException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionStage;

/** 通用 Command 调度端点 统一接收所有 Command 请求，通过 type 字段路由到对应的 Handler */
@Path("/api/commands")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CommandController {

  private static final Logger LOG = LoggerFactory.getLogger(CommandController.class);

  @Inject MessageGateway messageGateway;
  @Inject HandlerRegistry handlerRegistry;
  @Inject ObjectMapper objectMapper;

  /**
   * 执行 Command
   *
   * <p>请求示例：
   *
   * <pre>
   * {
   *   "type": "CreateUserCommand",
   *   "payload": {
   *     "username": "admin",
   *     "email": "admin@example.com",
   *     "password": "secret",
   *     "status": "ACTIVE",
   *     "tenantId": 1
   *   }
   * }
   * </pre>
   */
  @POST
  public CompletionStage<Response> execute(@Valid CommandRequest request) {
    if (request.type() == null || request.type().isBlank()) {
      return CompletableFuture.completedFuture(
          Response.status(Response.Status.BAD_REQUEST)
              .entity(CommandResponse.error("Missing command type"))
              .build());
    }

    // 1. 解析 Command 类型
    Class<? extends Command> commandClass = resolveCommandType(request.type());
    if (commandClass == null) {
      return CompletableFuture.completedFuture(
          Response.status(Response.Status.BAD_REQUEST)
              .entity(CommandResponse.error("Unknown command type: " + request.type()))
              .build());
    }

    // 2. 反序列化 payload
    final Command command;
    try {
      command = deserializePayload(request.payload(), commandClass);
    } catch (Exception e) {
      LOG.warn("Failed to deserialize command payload: {}", e.getMessage());
      return CompletableFuture.completedFuture(
          Response.status(Response.Status.BAD_REQUEST)
              .entity(CommandResponse.error("Invalid payload: " + e.getMessage()))
              .build());
    }

    // 3. 通过 Tower 的 MessageGateway 发送（Tower 会自动路由到对应的 Handler）
    // 使用 Object.class 作为结果类型，可以接收任何类型的返回值
    return messageGateway
        .sendAsync(command, Object.class)
        .thenApply(
            result -> result == null ? Response.noContent().build() : Response.ok(result).build())
        .exceptionally(
            e -> {
              LOG.error("Command execution failed: {}", e.getMessage(), e);
              return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                  .entity(CommandResponse.error("COMMAND_EXECUTION_FAILED", e.getMessage()))
                  .build();
            });
  }

  /** 解析 Command 类型，使用 Tower 的 HandlerRegistry */
  @SuppressWarnings("unchecked")
  private Class<? extends Command> resolveCommandType(String typeName) {
    // 尝试通过 Tower 的 HandlerRegistry 解析
    Class<? extends Command> commandClass = handlerRegistry.getCommandClass(typeName);

    if (commandClass == null && !typeName.contains(".")) {
      // 如果是简名，尝试首字母大写
      String capitalized = Character.toUpperCase(typeName.charAt(0)) + typeName.substring(1);
      commandClass = handlerRegistry.getCommandClass(capitalized);
    }

    return commandClass;
  }

  /** 反序列化 payload 为 Command 对象 */
  private Command deserializePayload(JsonNode payload, Class<? extends Command> commandClass)
      throws IOException {
    if (payload == null) {
      throw new IllegalArgumentException("Command payload is required");
    }
    return objectMapper.treeToValue(payload, commandClass);
  }
}
