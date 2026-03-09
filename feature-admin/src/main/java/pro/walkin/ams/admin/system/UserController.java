package pro.walkin.ams.admin.system;

import io.iamcyw.tower.messaging.gateway.MessageGateway;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.admin.system.command.user.*;
import pro.walkin.ams.admin.system.query.UserQuery;
import pro.walkin.ams.common.dto.UserDto;
import pro.walkin.ams.common.dto.UserResponseDto;
import pro.walkin.ams.common.dto.UserUpdateDto;
import pro.walkin.ams.common.security.TenantContext;
import pro.walkin.ams.common.security.annotation.RequireRole;
import pro.walkin.ams.common.security.util.SecurityUtils;

import java.util.Map;

@Path("/api/system/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserController {

  @Inject UserQuery userQuery;

  @Inject MessageGateway messageGateway;

  @GET
  public Response list(
      @QueryParam("username") String username,
      @QueryParam("email") String email,
      @QueryParam("status") String status,
      @QueryParam("sortBy") String sortBy,
      @QueryParam("sortOrder") @DefaultValue("DESC") String sortOrder,
      @QueryParam("page") @DefaultValue("0") int page,
      @QueryParam("size") @DefaultValue("20") int size) {

    var users = userQuery.findAllAsDto(username, email, status, sortBy, sortOrder, page, size);
    long total = userQuery.count(username, email, status);

    return Response.ok(
            Map.of(
                "content", users,
                "totalElements", total,
                "page", page,
                "size", size))
        .build();
  }

  @GET
  @Path("/{id}")
  public Response getById(@PathParam("id") Long id) {
    return ResponseBuilder.of(userQuery.findByIdAsDto(id));
  }

  @POST
  @RequireRole("ADMIN")
  public Response create(@Valid UserDto request) {
    Long tenantId = TenantContext.getCurrentTenantId();
    if (tenantId == null) {
      return Response.status(Response.Status.BAD_REQUEST)
          .entity(Map.of("message", "租户信息缺失"))
          .build();
    }

    messageGateway.send(
        new CreateUserCommand(
            request.getUsername(),
            request.getEmail(),
            request.getPassword(),
            request.getStatus(),
            tenantId));

    // Query the created user by username
    UserResponseDto user =
        userQuery.findByIdAsDto(
            userQuery
                .findByUsername(request.getUsername())
                .map(u -> u.id)
                .orElseThrow(() -> new RuntimeException("Failed to create user")));

    return Response.status(Response.Status.CREATED).entity(user).build();
  }

  @PUT
  @Path("/{id}")
  @RequireRole("ADMIN")
  public Response update(@PathParam("id") Long id, UserUpdateDto request) {
    messageGateway.send(
        new UpdateUserCommand(id, request.getUsername(), request.getEmail(), request.getStatus()));
    return ResponseBuilder.of(userQuery.findByIdAsDto(id));
  }

  @DELETE
  @Path("/{id}")
  @RequireRole("ADMIN")
  public Response delete(@PathParam("id") Long id, @Context SecurityContext securityContext) {
    Long currentUserId = SecurityUtils.getUserIdFromSecurityContext(securityContext);
    if (currentUserId != null && currentUserId.equals(id)) {
      return Response.status(Response.Status.BAD_REQUEST)
          .entity(Map.of("message", "不能删除自己"))
          .build();
    }

    messageGateway.send(new DeleteUserCommand(id));
    return Response.noContent().build();
  }

  @PUT
  @Path("/{id}/status")
  @RequireRole("ADMIN")
  public Response updateStatus(
      @PathParam("id") Long id,
      Map<String, String> body,
      @Context SecurityContext securityContext) {

    Long currentUserId = SecurityUtils.getUserIdFromSecurityContext(securityContext);
    if (currentUserId != null && currentUserId.equals(id)) {
      return Response.status(Response.Status.BAD_REQUEST)
          .entity(Map.of("message", "不能禁用自己"))
          .build();
    }

    String status = body.get("status");
    if (status == null || status.isBlank()) {
      return Response.status(Response.Status.BAD_REQUEST)
          .entity(Map.of("message", "状态不能为空"))
          .build();
    }

    messageGateway.send(new UpdateUserStatusCommand(id, status));
    return Response.ok().build();
  }

  @PUT
  @Path("/{id}/reset-password")
  @RequireRole("ADMIN")
  public Response resetPassword(@PathParam("id") Long id, Map<String, String> body) {
    String newPassword = body.get("password");
    if (newPassword == null || newPassword.length() < 8) {
      return Response.status(Response.Status.BAD_REQUEST)
          .entity(Map.of("message", "密码长度至少8位"))
          .build();
    }

    messageGateway.send(new ResetPasswordCommand(id, newPassword));
    return Response.ok(Map.of("message", "密码重置成功")).build();
  }
}
