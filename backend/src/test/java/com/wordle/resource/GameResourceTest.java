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

    @Test
    @TestSecurity(user = "NO_SESSION_USER", roles = "user")
    @JwtSecurity(claims = {
        @Claim(key = "upn", value = "NO_SESSION_USER")
    })
    public void testGuessWithoutActiveSessionReturns400() {
        // Since we haven't called /start in this test context, there's no active session.
        // It should throw IllegalArgumentException, which our mapper turns into 400.
        given()
          .contentType(ContentType.JSON)
          .body("{\"word\":\"APPLE\"}")
          .when().post("/api/game/guess")
          .then()
             .statusCode(400)
             .body("error", is("Aucune session de jeu active trouvée pour l'utilisateur. Appelez d'abord /start."));
    }

    @Test
    @TestSecurity(user = "NO_WIN_USER", roles = "user")
    @JwtSecurity(claims = {
        @Claim(key = "upn", value = "NO_WIN_USER")
    })
    public void testNextLevelWithoutWinningReturns400() {
        // Without winning a game first, /next-level should fail.
        given()
          .contentType(ContentType.JSON)
          .when().post("/api/game/next-level")
          .then()
             .statusCode(400)
             .body("error", is("Aucune session de niveau complété trouvée pour l'utilisateur."));
    }

    @Test
    @TestSecurity(user = "AI_ERROR_USER", roles = "user")
    @JwtSecurity(claims = {
        @Claim(key = "upn", value = "AI_ERROR_USER")
    })
    public void testAIErrorReturns500WithCleanJSON() {
        // Simulate a complete AI failure that throws a generic RuntimeException
        Mockito.when(wordGeneratorAIMock.generateNextWord(1, "START")).thenThrow(new RuntimeException("Groq API Timeout"));

        given()
          .contentType(ContentType.JSON)
          .when().post("/api/game/start")
          .then()
             .statusCode(500)
             .body("error", is("Une erreur interne est survenue."))
             .body("referenceId", notNullValue());
    }

}
