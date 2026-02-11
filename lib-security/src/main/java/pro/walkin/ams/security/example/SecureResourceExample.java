package pro.walkin.ams.security.example;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.SecurityContext;
import pro.walkin.ams.security.annotation.RequirePermission;
import pro.walkin.ams.security.annotation.RequirePermissions;
import pro.walkin.ams.security.service.RbacService;

/**
 * 安全资源使用示例
 * 
 * 展示如何在REST端点中使用认证和权限注解
 */
@Path("/examples")
@Produces(MediaType.APPLICATION_JSON)
public class SecureResourceExample {

    @Inject
    RbacService rbacService;

    /**
     * 公共访问端点 - 任何用户都可以访问
     */
    @GET
    @Path("/public")
    public String publicEndpoint() {
        return "{\"message\": \"This is a public endpoint accessible to everyone\"}";
    }

    /**
     * 需要特定权限的端点
     */
    @GET
    @Path("/protected/alarm-read")
    @RequirePermission("ALARM_READ")
    public String alarmReadProtectedEndpoint() {
        return "{\"message\": \"You have permission to read alarms\"}";
    }

    /**
     * 需要多种权限（全部）的端点
     */
    @POST
    @Path("/protected/alarm-create")
    @RequirePermissions(value = {"ALARM_READ", "ALARM_WRITE"}, operator = RequirePermissions.LogicalOperator.ALL)
    public String alarmCreateProtectedEndpoint() {
        return "{\"message\": \"You have permission to create alarms\"}";
    }

    /**
     * 需要多种权限（任意一种）的端点
     */
    @PUT
    @Path("/protected/alarm-update")
    @RequirePermissions(value = {"ALARM_WRITE", "ALARM_DELETE"}, operator = RequirePermissions.LogicalOperator.ANY)
    public String alarmUpdateProtectedEndpoint() {
        return "{\"message\": \"You have permission to update alarms\"}";
    }

    /**
     * 需要用户身份验证但不需要特定权限的端点
     */
    @GET
    @Path("/authenticated")
    public String authenticatedEndpoint(@Context SecurityContext securityContext) {
        String user = securityContext.getUserPrincipal() != null ? securityContext.getUserPrincipal().getName() : "unknown";
        return "{\"message\": \"Hello " + user + ", you are authenticated\"}";
    }

    /**
     * 管理员专用端点
     */
    @DELETE
    @Path("/admin/users/{id}")
    @RequirePermission("USER_WRITE")
    public String deleteUser(@PathParam("id") Long userId) {
        return "{\"message\": \"User " + userId + " deleted\", \"user_id\": " + userId + "}";
    }
}