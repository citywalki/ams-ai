package pro.walkin.ams.admin.system.query;

import io.quarkus.panache.common.Parameters;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;
import java.util.Optional;
import pro.walkin.ams.persistence.entity.system.User;
import pro.walkin.ams.persistence.entity.system.User_;

/**
 * 用户查询类
 * 所有用户相关的查询方法都放在这里
 */
@ApplicationScoped
public class UserQuery {

    public Optional<User> findById(Long id) {
        return User_.managedBlocking().findByIdOptional(id);
    }

    public Optional<User> findByUsername(String username) {
        return User_.managedBlocking().find("username", username).firstResultOptional();
    }

    public Optional<User> findByEmail(String email) {
        return User_.managedBlocking().find("email", email).firstResultOptional();
    }

    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        return User_.managedBlocking()
            .find(
                "lower(username) = lower(:username) or lower(email) = lower(:email)",
                Parameters.with("username", usernameOrEmail).and("email", usernameOrEmail).map()
            )
            .firstResultOptional();
    }

    public List<User> findByFilters(Long tenantId, String username, String email, String status, String sortBy, String sortOrder, int page, int size) {
        StringBuilder query = new StringBuilder("tenant = :tenantId");
        Parameters params = Parameters.with("tenantId", tenantId);

        if (username != null && !username.isBlank()) {
            query.append(" and lower(username) like lower(:username)");
            params = params.and("username", "%" + username + "%");
        }
        if (email != null && !email.isBlank()) {
            query.append(" and lower(email) like lower(:email)");
            params = params.and("email", "%" + email + "%");
        }
        if (status != null && !status.isBlank()) {
            query.append(" and status = :status");
            params = params.and("status", status);
        }

        String sortField = mapSortField(sortBy);
        String direction = "DESC".equalsIgnoreCase(sortOrder) ? "DESC" : "ASC";
        query.append(" order by ").append(sortField).append(" ").append(direction);

        return User_.managedBlocking().find(query.toString(), params.map()).page(page, size).list();
    }

    public long countByFilters(Long tenantId, String username, String email, String status) {
        StringBuilder query = new StringBuilder("tenant = :tenantId");
        Parameters params = Parameters.with("tenantId", tenantId);

        if (username != null && !username.isBlank()) {
            query.append(" and lower(username) like lower(:username)");
            params = params.and("username", "%" + username + "%");
        }
        if (email != null && !email.isBlank()) {
            query.append(" and lower(email) like lower(:email)");
            params = params.and("email", "%" + email + "%");
        }
        if (status != null && !status.isBlank()) {
            query.append(" and status = :status");
            params = params.and("status", status);
        }

        return User_.managedBlocking().count(query.toString(), params.map());
    }

    public User findByIdWithRolesAndPermissions(Long userId) {
        return User_.managedBlocking()
            .<User>find(
                "SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles r LEFT JOIN FETCH r.permissions WHERE u.id = ?1",
                userId
            )
            .stream()
            .findFirst()
            .orElse(null);
    }

    public User findByUsernameWithRolesAndPermissions(String username) {
        return User_.managedBlocking()
            .<User>find(
                "SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles r LEFT JOIN FETCH r.permissions WHERE u.username = ?1",
                username
            )
            .stream()
            .findFirst()
            .orElse(null);
    }

    public long countUsersByRoleId(Long roleId) {
        return User_.managedBlocking().count(
            "select count(u) from User u join u.roles r where r.id = ?1",
            roleId
        );
    }

    private String mapSortField(String sortBy) {
        if (sortBy == null) {
            return "createdAt";
        }
        return switch (sortBy) {
            case "username" -> "username";
            case "email" -> "email";
            case "status" -> "status";
            case "createdAt" -> "createdAt";
            case "updatedAt" -> "updatedAt";
            default -> "createdAt";
        };
    }
}
