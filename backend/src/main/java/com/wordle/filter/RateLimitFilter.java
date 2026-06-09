package com.wordle.filter;

import io.vertx.core.http.HttpServerRequest;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Provider
public class RateLimitFilter implements ContainerRequestFilter {
    
    // IP -> { Count, WindowStartTimestamp }
    private static final Map<String, RateLimitEntry> ipRequests = new ConcurrentHashMap<>();
    private static final int MAX_REQUESTS_PER_HOUR = 100;
    private static final long TIME_WINDOW_MS = 3600000; // 1 hour

    static class RateLimitEntry {
        AtomicInteger count = new AtomicInteger(1);
        long windowStart = Instant.now().toEpochMilli();
    }

    @Context
    HttpServerRequest request;

    @Override
    public void filter(ContainerRequestContext requestContext) {
        if (requestContext.getUriInfo().getPath().endsWith("/api/auth/register") && "POST".equalsIgnoreCase(requestContext.getMethod())) {
            String ip = request.remoteAddress().host();
            
            long now = Instant.now().toEpochMilli();
            RateLimitEntry entry = ipRequests.computeIfAbsent(ip, k -> new RateLimitEntry());
            
            if (now - entry.windowStart > TIME_WINDOW_MS) {
                // Reset window
                entry.count.set(1);
                entry.windowStart = now;
            } else {
                if (entry.count.incrementAndGet() > MAX_REQUESTS_PER_HOUR) {
                    requestContext.abortWith(Response.status(429)
                        .entity("{\"error\":\"Trop de tentatives de création de compte depuis cette adresse IP. Veuillez réessayer plus tard.\"}")
                        .build());
                }
            }
        }
    }
}
