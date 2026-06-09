package com.wordle.resource;

import com.wordle.service.WordGeneratorAI;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.InjectMock;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import io.quarkus.test.security.TestSecurity;
import io.quarkus.test.security.jwt.Claim;
import io.quarkus.test.security.jwt.JwtSecurity;

@QuarkusTest
public class GameResourceTest {

    @InjectMock
    WordGeneratorAI wordGeneratorAIMock;

    @Test
    public void testGetSystemStatus() {
        // Mock the ping method to succeed
        Mockito.when(wordGeneratorAIMock.ping()).thenReturn("ping");

        given()
          .when().get("/api/game/status")
          .then()
             .statusCode(200)
             .body("aiConnected", notNullValue()); // True or false depending on env vars, but should not crash (503/500)
    }

    @Test
    @TestSecurity(user = "TESTUSER", roles = "user")
    @JwtSecurity(claims = {
        @Claim(key = "upn", value = "TESTUSER")
    })
    public void testStartGameSuccess() {
        // Mock the word generation for a new game
        Mockito.when(wordGeneratorAIMock.generateNextWord(1, "START")).thenReturn("TESTS");

        given()
          .contentType(ContentType.JSON)
          .when().post("/api/game/start")
          .then()
             .statusCode(200)
             .body("username", is("testuser"))
             .body("currentLevel", is(1))
             .body("status", is("IN_PROGRESS"));
    }

    @Test
    public void testStartGameWithoutToken() {
        given()
          .contentType(ContentType.JSON)
          .when().post("/api/game/start")
          .then()
             .statusCode(401);
    }

    @Test
    public void testGetLeaderboard() {
        given()
          .when().get("/api/game/leaderboard")
          .then()
             .statusCode(200);
    }
}
