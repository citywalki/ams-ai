package pro.walkin.ams.security;

import io.quarkus.test.component.QuarkusComponentTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.*;

@QuarkusComponentTest
class PasswordServiceTest {

    @Inject
    PasswordService passwordService;

    @Nested
    @DisplayName("hashPassword")
    class HashPassword {
        
        @Test
        @DisplayName("should return base64 hash for valid password")
        void shouldReturnBase64Hash() {
            String password = "TestPassword123";
            String hash = passwordService.hashPassword(password);
            
            assertThat(hash).isNotNull();
            assertThat(hash).isNotEmpty();
            assertThat(hash).isBase64();
        }
        
        @Test
        @DisplayName("should throw exception for null password")
        void shouldThrowForNullPassword() {
            assertThatThrownBy(() -> passwordService.hashPassword(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cannot be null");
        }
        
        @Test
        @DisplayName("should produce same hash for same password")
        void shouldProduceSameHash() {
            String password = "SamePassword456";
            String hash1 = passwordService.hashPassword(password);
            String hash2 = passwordService.hashPassword(password);
            
            assertThat(hash1).isEqualTo(hash2);
        }
    }

    @Nested
    @DisplayName("verifyPassword")
    class VerifyPassword {
        
        @Test
        @DisplayName("should return true for correct password")
        void shouldReturnTrueForCorrectPassword() {
            String password = "CorrectPassword789";
            String hash = passwordService.hashPassword(password);
            
            assertThat(passwordService.verifyPassword(password, hash)).isTrue();
        }
        
        @Test
        @DisplayName("should return false for wrong password")
        void shouldReturnFalseForWrongPassword() {
            String password = "OriginalPassword";
            String hash = passwordService.hashPassword(password);
            
            assertThat(passwordService.verifyPassword("WrongPassword", hash)).isFalse();
        }
        
        @Test
        @DisplayName("should return false for null password")
        void shouldReturnFalseForNullPassword() {
            String hash = passwordService.hashPassword("SomePassword");
            
            assertThat(passwordService.verifyPassword(null, hash)).isFalse();
        }
        
        @Test
        @DisplayName("should return false for null hash")
        void shouldReturnFalseForNullHash() {
            assertThat(passwordService.verifyPassword("SomePassword", null)).isFalse();
        }
    }

    @Nested
    @DisplayName("validatePasswordStrength")
    class ValidatePasswordStrength {
        
        @Test
        @DisplayName("should return true for password with 8+ characters")
        void shouldReturnTrueForLongPassword() {
            assertThat(passwordService.validatePasswordStrength("12345678")).isTrue();
            assertThat(passwordService.validatePasswordStrength("VeryLongPassword123")).isTrue();
        }
        
        @Test
        @DisplayName("should return false for password with less than 8 characters")
        void shouldReturnFalseForShortPassword() {
            assertThat(passwordService.validatePasswordStrength("1234567")).isFalse();
            assertThat(passwordService.validatePasswordStrength("")).isFalse();
        }
        
        @Test
        @DisplayName("should return false for null password")
        void shouldReturnFalseForNullPassword() {
            assertThat(passwordService.validatePasswordStrength(null)).isFalse();
        }
    }
}
