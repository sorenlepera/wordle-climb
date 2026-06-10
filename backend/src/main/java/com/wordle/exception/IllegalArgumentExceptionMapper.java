package com.wordle.exception;

import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

import java.util.Map;

public class IllegalArgumentExceptionMapper {

    @ServerExceptionMapper
    public Response mapException(IllegalArgumentException x) {
        // Return a clean 400 Bad Request instead of 500 or handling manually
        return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(
                        "error", x.getMessage() != null ? x.getMessage() : "Invalid argument provided."
                ))
                .build();
    }
}
