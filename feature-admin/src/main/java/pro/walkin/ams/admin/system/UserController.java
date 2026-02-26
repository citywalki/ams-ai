package pro.walkin.ams.admin.system;

import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import java.util.List;
import java.util.Map;
import pro.walkin.ams.admin.common.ResponseBuilder;
import pro.walkin.ams.common.dto.UserDto;
import pro.walkin.ams.common.dto.UserResponseDto;
import pro.walkin.ams.common.dto.UserUpdateDto;
import pro.walkin.ams.security.annotation.RequireRole;
import pro.walkin.ams.security.util.SecurityUtils;

@Path("/api/system/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UserController {

    @Inject
    UserService userService;

    @GET
    @RequireRole("ADMIN")
    public Response findAll(
        @QueryParam("page") @DefaultValue("0") int page,
        @QueryParam("size") @DefaultValue("20") int size,
        @QueryParam("username") String username,
        @QueryParam("email") String email,
        @QueryParam("status") String status,
        @QueryParam("sortBy") @DefaultValue("createdAt") String sortBy,
        @QueryParam("sortOrder") @DefaultValue("DESC") String sortOrder
    ) {
        List<UserResponseDto> users = userService.findAll(username, email, status, sortBy, sortOrder, page, size);
        long totalCount = userService.count(username, email, status);
        long totalPages = (long) Math.ceil((double) totalCount / size);
        return ResponseBuilder.page(users, totalCount, totalPages, page, size);
    }

    @GET
    @Path("/{id}")
    @RequireRole("ADMIN")
    public Response findById(@PathParam("id") Long id) {
        return ResponseBuilder.of(userService.findById(id));
    }

    @POST
    @RequireRole("ADMIN")
    public Response create(@Valid UserDto request) {
        UserResponseDto user = userService.create(request);
        return Response.status(Response.Status.CREATED).entity(user).build();
    }

    @PUT
    @Path("/{id}")
    @RequireRole("ADMIN")
    public Response update(@PathParam("id") Long id, UserUpdateDto request) {
        return ResponseBuilder.of(userService.update(id, request));
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
        userService.delete(id);
        return Response.noContent().build();
    }

    @PUT
    @Path("/{id}/status")
    @RequireRole("ADMIN")
    public Response updateStatus(@PathParam("id") Long id, Map<String, String> body, @Context SecurityContext securityContext) {
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
        userService.updateStatus(id, status);
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
        userService.resetPassword(id, newPassword);
        return Response.ok(Map.of("message", "密码重置成功")).build();
    }
}
