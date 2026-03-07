package pro.walkin.ams.admin.system.service;

import io.quarkus.test.component.QuarkusComponentTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import pro.walkin.ams.common.dto.MenuDto;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * 菜单服务测试类
 */
@QuarkusComponentTest
@DisplayName("MenuService 测试")
class MenuServiceTest {

  @Inject MenuService menuService;

  @Nested
  @DisplayName("服务注入")
  class Injection {

    @Test
    @DisplayName("服务应可注入")
    void shouldBeInjectable() {
      assertThat(menuService).isNotNull();
    }
  }

  @Nested
  @DisplayName("创建菜单参数验证")
  class CreateMenuValidation {

    @Test
    @DisplayName("当 dto 为 null 时应抛出异常")
    void shouldThrowWhenDtoIsNull() {
      assertThatThrownBy(() -> menuService.createMenu(null, 1L))
          .isInstanceOf(NullPointerException.class)
          .hasMessageContaining("菜单数据不能为空");
    }

    @Test
    @DisplayName("当 tenantId 为 null 时应抛出异常")
    void shouldThrowWhenTenantIdIsNull() {
      MenuDto dto =
          new MenuDto(
              "test-key", "Test Menu", "/test", null, null, 1, true, "MENU", List.of(), Map.of());

      assertThatThrownBy(() -> menuService.createMenu(dto, null))
          .isInstanceOf(NullPointerException.class)
          .hasMessageContaining("租户ID不能为空");
    }
  }

  @Nested
  @DisplayName("查询菜单参数验证")
  class GetMenuByIdValidation {

    @Test
    @DisplayName("当 id 为 null 时应抛出异常")
    void shouldThrowWhenIdIsNull() {
      assertThatThrownBy(() -> menuService.getMenuById(null, 1L))
          .isInstanceOf(NullPointerException.class)
          .hasMessageContaining("菜单ID不能为空");
    }

    @Test
    @DisplayName("当 tenantId 为 null 时应抛出异常")
    void shouldThrowWhenTenantIdIsNull() {
      assertThatThrownBy(() -> menuService.getMenuById(1L, null))
          .isInstanceOf(NullPointerException.class)
          .hasMessageContaining("租户ID不能为空");
    }
  }

  @Nested
  @DisplayName("删除菜单参数验证")
  class DeleteMenuValidation {

    @Test
    @DisplayName("当 id 为 null 时应抛出异常")
    void shouldThrowWhenIdIsNull() {
      assertThatThrownBy(() -> menuService.deleteMenu(null, 1L))
          .isInstanceOf(NullPointerException.class)
          .hasMessageContaining("菜单ID不能为空");
    }

    @Test
    @DisplayName("当 tenantId 为 null 时应抛出异常")
    void shouldThrowWhenTenantIdIsNull() {
      assertThatThrownBy(() -> menuService.deleteMenu(1L, null))
          .isInstanceOf(NullPointerException.class)
          .hasMessageContaining("租户ID不能为空");
    }
  }
}
