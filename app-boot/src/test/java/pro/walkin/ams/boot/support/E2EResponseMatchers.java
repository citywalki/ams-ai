package pro.walkin.ams.boot.support;

import org.assertj.core.api.Assertions;

public class E2EResponseMatchers {

  public static void assertSuccessResponse(int statusCode) {
    Assertions.assertThat(statusCode).as("Expected success status code (2xx)").isBetween(200, 299);
  }

  public static void assertErrorResponse(int statusCode) {
    Assertions.assertThat(statusCode)
        .as("Expected error status code (4xx or 5xx)")
        .isGreaterThanOrEqualTo(400);
  }

  public static void assertCreatedResponse(int statusCode) {
    Assertions.assertThat(statusCode).as("Expected 201 Created").isEqualTo(201);
  }
}
