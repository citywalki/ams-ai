package pro.walkin.ams.boot.it;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@QuarkusTest
class ApplicationIT {

  @Test
  @DisplayName("application should start successfully")
  void shouldStartApplication() {
    // If the application starts, this test passes
    assertThat(true).isTrue();
  }
}
