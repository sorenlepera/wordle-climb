package com.wordle.exception;

import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;
import org.jboss.logging.Logger;

import java.util.UUID;
import java.util.Map;

public class GlobalExceptionMapper {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionMapper.class);

    @ServerExceptionMapper
    public Response mapException(Exception x) {
        // Generate a unique reference ID for this error to help developers trace it in logs
        String errorRef = UUID.randomUUID().toString();

        // Log the full stack trace with the reference ID
        LOG.errorf(x, "Unhandled exception occurred (Ref: %s)", errorRef);

        // If it's a known WebApplicationException (like 404, 401), we can preserve the status
        int status = Response.Status.INTERNAL_SERVER_ERROR.getStatusCode();
        if (x instanceof WebApplicationException wae) {
            status = wae.getResponse().getStatus();
            // Don't mask standard Quarkus errors like 404 Not Found completely if they are intentional
            if (status != 500) {
                return wae.getResponse();
            }
        }

        // Return a safe, generic JSON message to the client
        return Response.status(status)
                .entity(Map.of(
                        "error", "Une erreur interne est survenue.",
                        "referenceId", errorRef
                ))
                .build();
    }
}
