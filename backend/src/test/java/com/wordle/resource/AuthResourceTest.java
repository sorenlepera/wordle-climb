package com.wordle.resource;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
public class AuthResourceTest {

    @Test
    public void testRegisterValidationFailureReturns400() {
        // Send a registration request with an empty username
        given()
          .contentType(ContentType.JSON)
          .body(Map.of("username", "", "password", "validpassword123"))
        .when()
          .post("/api/auth/register")
        .then()
          .statusCode(400)
          .body("error", is("Invalid input")); // Mapped by our ConstraintViolationExceptionMapper
    }

    @Test
    public void testRegisterPasswordTooShortReturns400() {
        // Send a registration request with a password < 6 chars
        given()
          .contentType(ContentType.JSON)
          .body(Map.of("username", "validuser", "password", "123"))
        .when()
          .post("/api/auth/register")
        .then()
          .statusCode(400)
          .body("error", is("Invalid input"));
    }

    @Test
    public void testLoginRateLimiting() {
        // The bucket limit is 5 per minute per IP.
        // We will make 6 bad login requests. The 6th should return 429.
        
        for (int i = 0; i < 5; i++) {
            given()
              .contentType(ContentType.JSON)
              .body(Map.of("username", "someuser", "password", "wrongpass"))
            .when()
              .post("/api/auth/login")
            .then()
              // First 5 attempts should just fail normally with 401 Unauthorized
              .statusCode(401); 
        }

        // The 6th attempt should hit the bucket4j limit and return 429
        given()
          .contentType(ContentType.JSON)
          .body(Map.of("username", "someuser", "password", "wrongpass"))
        .when()
          .post("/api/auth/login")
        .then()
          .statusCode(429)
          .body("error", containsString("Too many login attempts"));
    }
}
