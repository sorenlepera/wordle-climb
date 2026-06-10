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
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Duration;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    public static class AuthRequest {
        @NotBlank(message = "Le pseudo est requis")
        @Size(min = 3, max = 20, message = "Le pseudo doit contenir entre 3 et 20 caractères")
        public String username;

        @NotBlank(message = "Le mot de passe est requis")
        @Size(min = 6, max = 50, message = "Le mot de passe doit contenir entre 6 et 50 caractères")
        public String password;
    }

    @POST
    @Path("/register")
    @Transactional
    public Response register(@Valid AuthRequest request) {
        String lowerUsername = request.username.trim().toLowerCase();
        if (User.findByUsername(lowerUsername) != null) {
            return Response.status(409).entity("{\"error\":\"Ce pseudo existe déjà\"}").build();
        }
        
        User user = new User();
        user.username = lowerUsername;
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
    public Response login(@Valid AuthRequest request) {
        String lowerUsername = request.username.trim().toLowerCase();
        User user = User.findByUsername(lowerUsername);
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
