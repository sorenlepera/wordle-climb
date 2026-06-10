package com.wordle.resource;

import com.wordle.dto.*;
import com.wordle.service.GameService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import io.quarkus.security.Authenticated;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/game")
@Tag(name = "Game API", description = "Endpoints for managing the Wordle game sessions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GameResource {

    @Inject
    GameService gameService;

    @Inject
    JsonWebToken jwt;

    @POST
    @Path("/start")
    @Authenticated
    @Operation(summary = "Start a new game", description = "Starts a new game session or resumes an existing one for the authenticated user")
    public Response startGame() {
        String username = jwt.getName();
        if (username == null || username.trim().isEmpty()) {
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity("Non authentifié")
                .build();
        }

        username = username.trim().toLowerCase();
        return Response.ok(gameService.startGame(username)).build();
    }

    @POST
    @Path("/guess")
    @Authenticated
    @Operation(summary = "Submit a guess", description = "Submits a 5-letter word guess for the current game session")
    public Response submitGuess(@Valid GuessRequest request) {
        String username = jwt.getName();
        if (username == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        username = username.trim().toLowerCase();

        return Response.ok(gameService.submitGuess(username, request.word().trim().toUpperCase())).build();
    }

    @GET
    @Path("/leaderboard")
    @io.smallrye.common.annotation.Blocking
    @Operation(summary = "Get leaderboard", description = "Returns the top players ranked by max score. This endpoint is cached.")
    public List<LeaderboardEntry> getLeaderboard() {
        return gameService.getLeaderboard();
    }

    @GET
    @Path("/status")
    @io.smallrye.common.annotation.Blocking
    @Operation(summary = "Get system status", description = "Returns the current health status and AI integration status")
    public Response getSystemStatus() {
        return Response.ok(gameService.getSystemStatus()).build();
    }

    @POST
    @Path("/next-level")
    @Authenticated
    @Operation(summary = "Proceed to next level", description = "Generates a new word for the next level after winning the current one")
    public Response nextLevel() {
        String username = jwt.getName();
        if (username == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        
        username = username.trim().toLowerCase();
        return Response.ok(gameService.nextLevel(username)).build();
    }
}

