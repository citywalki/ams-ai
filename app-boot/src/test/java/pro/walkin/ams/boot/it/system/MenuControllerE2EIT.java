package pro.walkin.ams.boot.it.system;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.boot.support.E2ETestBase;

@QuarkusTest
@DisplayName("菜单管理 E2E 测试")
class MenuControllerE2EIT extends E2ETestBase {

    @Test
    @DisplayName("MENU-E2E-01: 查询菜单列表")
    void shouldListMenus() {
        // TODO: 实现完整测试
    }
}
