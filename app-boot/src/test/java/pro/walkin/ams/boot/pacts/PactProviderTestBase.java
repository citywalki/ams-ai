package pro.walkin.ams.boot.pacts;

import au.com.dius.pact.provider.junit5.HttpTestTarget;
import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.loader.PactFolder;
import io.quarkus.test.common.http.TestHTTPResource;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;

import java.net.URL;

@QuarkusTest
@Provider("ams-api")
@PactFolder("../app-web/e2e/pacts")
public abstract class PactProviderTestBase {

  @TestHTTPResource("/")
  URL baseUrl;

  @BeforeEach
  void setupTestTarget(PactVerificationContext context) {
    if (context != null && baseUrl != null) {
      context.setTarget(new HttpTestTarget(baseUrl.getHost(), baseUrl.getPort()));
    }
  }

  @TestTemplate
  @ExtendWith(PactVerificationInvocationContextProvider.class)
  void pactVerificationTestTemplate(PactVerificationContext context) {
    if (context != null) {
      context.verifyInteraction();
    }
  }
}
