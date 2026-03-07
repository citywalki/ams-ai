package pro.walkin.ams.boot.pacts;

import au.com.dius.pact.provider.junitsupport.State;
import io.quarkus.test.common.QuarkusTestResource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.BeforeEach;
import pro.walkin.ams.boot.it.PostgresTestResource;

@QuarkusTest
@QuarkusTestResource(PostgresTestResource.class)
public class AuthPactProviderTest extends PactProviderTestBase {

  @Inject EntityManager entityManager;

  @BeforeEach
  @Transactional
  void setUp() {
    // 确保测试用户存在
    ensureTestUserExists();
  }

  @State("用户存在且密码正确")
  public void userExistsWithCorrectPassword() {
    // 状态已在 setUp 中设置
  }

  @State("用户已登录")
  public void userIsLoggedIn() {
    // 验证 token 生成逻辑
  }

  @Transactional
  void ensureTestUserExists() {
    // 检查并创建测试用户
    Long count =
        ((Number)
                entityManager
                    .createNativeQuery("SELECT COUNT(*) FROM users WHERE username = 'admin'")
                    .getSingleResult())
            .longValue();

    if (count == 0) {
      entityManager
          .createNativeQuery(
              "INSERT INTO users (id, username, password, email, status, tenant_id) VALUES (?, ?, ?, ?, ?, ?)")
          .setParameter(1, System.currentTimeMillis())
          .setParameter(2, "admin")
          .setParameter(3, "$2a$10$...") // bcrypt hash
          .setParameter(4, "admin@test.com")
          .setParameter(5, "ACTIVE")
          .setParameter(6, 1)
          .executeUpdate();
    }
  }
}
