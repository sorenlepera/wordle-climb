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

@Path("/api/game")
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
    public Response submitGuess(@Valid GuessRequest request) {
        String username = jwt.getName();
        if (username == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        username = username.trim().toLowerCase();

        try {
            return Response.ok(gameService.submitGuess(username, request.word().trim().toUpperCase())).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(e.getMessage())
                .build();
        }
    }

    @GET
    @Path("/leaderboard")
    @io.smallrye.common.annotation.Blocking
    public List<LeaderboardEntry> getLeaderboard() {
        return gameService.getLeaderboard();
    }

    @GET
    @Path("/status")
    @io.smallrye.common.annotation.Blocking
    public Response getSystemStatus() {
        return Response.ok(gameService.getSystemStatus()).build();
    }

    @POST
    @Path("/next-level")
    @Authenticated
    public Response nextLevel() {
        String username = jwt.getName();
        if (username == null) {
            return Response.status(Response.Status.UNAUTHORIZED).build();
        }
        
        username = username.trim().toLowerCase();
        try {
            return Response.ok(gameService.nextLevel(username)).build();
        } catch (IllegalArgumentException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(e.getMessage())
                .build();
        }
    }
}

