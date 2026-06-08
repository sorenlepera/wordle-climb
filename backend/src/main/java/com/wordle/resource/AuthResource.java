package com.wordle.resource;

import com.wordle.model.PlayerProfile;
import com.wordle.model.User;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.jwt.build.Jwt;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.Duration;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    public static class AuthRequest {
        public String username;
        public String password;
    }

    @POST
    @Path("/register")
    @Transactional
    public Response register(AuthRequest request) {
        if (request.username == null || request.password == null || request.username.trim().isEmpty() || request.password.trim().isEmpty()) {
            return Response.status(400).entity("{\"error\":\"Invalid input\"}").build();
        }
        if (User.findByUsername(request.username) != null) {
            return Response.status(409).entity("{\"error\":\"Ce pseudo existe déjà\"}").build();
        }
        
        User user = new User();
        user.username = request.username.trim();
        user.passwordHash = BcryptUtil.bcryptHash(request.password);
        user.persist();

        PlayerProfile profile = new PlayerProfile();
        profile.username = user.username;
        profile.user = user;
        profile.persist();

        String token = Jwt.issuer("https://wordle.climb")
                .upn(user.username)
                .expiresIn(Duration.ofDays(7))
                .sign();

        return Response.ok("{\"token\":\"" + token + "\"}").build();
    }

    @POST
    @Path("/login")
    public Response login(AuthRequest request) {
        User user = User.findByUsername(request.username);
        if (user == null || !BcryptUtil.matches(request.password, user.passwordHash)) {
            return Response.status(401).entity("{\"error\":\"Identifiants incorrects\"}").build();
        }

        String token = Jwt.issuer("https://wordle.climb")
                .upn(user.username)
                .expiresIn(Duration.ofDays(7))
                .sign();

        return Response.ok("{\"token\":\"" + token + "\"}").build();
    }
}
