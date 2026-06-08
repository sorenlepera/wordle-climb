package com.wordle.client;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

/**
 * Declarative REST Client interface pointing to the French Wiktionary MediaWiki API.
 */
@RegisterRestClient(baseUri = "https://fr.wiktionary.org/w/api.php")
public interface DictionaryClient {

    @GET
    Response checkWord(
        @QueryParam("action") String action,
        @QueryParam("titles") String titles,
        @QueryParam("format") String format,
        @QueryParam("origin") String origin,
        @QueryParam("redirects") int redirects
    );
}
