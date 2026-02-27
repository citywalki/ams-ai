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

@QuarkusComponentTest
class MenuServiceTest {

    @Inject
    MenuService menuService;

    @Nested
    @DisplayName("Injection")
    class Injection {
        
        @Test
        @DisplayName("should be injectable")
        void shouldBeInjectable() {
            assertThat(menuService).isNotNull();
        }
    }
    
    @Nested
    @DisplayName("createMenu validation")
    class CreateMenuValidation {
        
        @Test
        @DisplayName("should throw NullPointerException when dto is null")
        void shouldThrowWhenDtoIsNull() {
            assertThatThrownBy(() -> menuService.createMenu(null, 1L))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("菜单数据不能为空");
        }
        
        @Test
        @DisplayName("should throw NullPointerException when tenantId is null")
        void shouldThrowWhenTenantIdIsNull() {
            MenuDto dto = new MenuDto("test-key", "Test Menu", "/test", null, null, 1, true, "MENU", List.of(), Map.of());
            
            assertThatThrownBy(() -> menuService.createMenu(dto, null))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("租户ID不能为空");
        }
    }
    
    @Nested
    @DisplayName("getMenuById validation")
    class GetMenuByIdValidation {
        
        @Test
        @DisplayName("should throw NullPointerException when id is null")
        void shouldThrowWhenIdIsNull() {
            assertThatThrownBy(() -> menuService.getMenuById(null, 1L))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("菜单ID不能为空");
        }
        
        @Test
        @DisplayName("should throw NullPointerException when tenantId is null")
        void shouldThrowWhenTenantIdIsNull() {
            assertThatThrownBy(() -> menuService.getMenuById(1L, null))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("租户ID不能为空");
        }
    }
    
    @Nested
    @DisplayName("deleteMenu validation")
    class DeleteMenuValidation {
        
        @Test
        @DisplayName("should throw NullPointerException when id is null")
        void shouldThrowWhenIdIsNull() {
            assertThatThrownBy(() -> menuService.deleteMenu(null, 1L))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("菜单ID不能为空");
        }
        
        @Test
        @DisplayName("should throw NullPointerException when tenantId is null")
        void shouldThrowWhenTenantIdIsNull() {
            assertThatThrownBy(() -> menuService.deleteMenu(1L, null))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("租户ID不能为空");
        }
    }
}
