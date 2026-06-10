package com.wordle.resource;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import jakarta.ws.rs.core.Context;
import io.vertx.core.http.HttpServerRequest;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Provider
public class RateLimitFilter implements ContainerRequestFilter {

    private final Map<String, Bucket> authBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> gameBuckets = new ConcurrentHashMap<>();

    private Bucket resolveAuthBucket(String ip) {
        return authBuckets.computeIfAbsent(ip, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1))))
                .build());
    }

    private Bucket resolveGameBucket(String ip) {
        return gameBuckets.computeIfAbsent(ip, k -> Bucket.builder()
                .addLimit(Bandwidth.classic(10, Refill.intervally(10, Duration.ofMinutes(1))))
                .build());
    }

    @Context
    HttpServerRequest httpRequest;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        String path = requestContext.getUriInfo().getPath();
        
        String ip = httpRequest.remoteAddress().host();
        if (httpRequest.getHeader("X-Forwarded-For") != null) {
            ip = httpRequest.getHeader("X-Forwarded-For").split(",")[0].trim();
        } 

        if (path.equals("/api/auth/login")) {
            Bucket bucket = resolveAuthBucket(ip);
            if (!bucket.tryConsume(1)) {
                requestContext.abortWith(Response.status(429)
                        .entity("{\"error\":\"Too many login attempts. Try again in 1 minute.\"}")
                        .build());
            }
        } else if (path.equals("/api/game/start") || path.equals("/api/game/next-level")) {
            Bucket bucket = resolveGameBucket(ip);
            if (!bucket.tryConsume(1)) {
                requestContext.abortWith(Response.status(429)
                        .entity("{\"error\":\"Too many game requests. Try again in 1 minute.\"}")
                        .build());
            }
        }
    }
}
