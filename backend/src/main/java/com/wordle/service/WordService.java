package com.wordle.service;

import com.wordle.client.DictionaryClient;
import com.wordle.model.CachedWord;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import java.text.Normalizer;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@ApplicationScoped
public class WordService {

    @Inject
    @RestClient
    DictionaryClient dictionaryClient;

    @Inject
    WordGeneratorAI wordGeneratorAI;

    // In-memory cache of words that have been verified as valid
    private final Set<String> cacheOfValidWords = new HashSet<>();

    @PostConstruct
    public void init() {
        System.out.println("⏳ WordService cache initializing...");
        try {
            io.quarkus.narayana.jta.QuarkusTransaction.requiringNew().run(() -> {
                // 1. Load what's already in the database
                List<CachedWord> persistedWords = CachedWord.listAll();
                for (CachedWord cw : persistedWords) {
                    cacheOfValidWords.add(cw.word.toUpperCase());
                }

                // 2. If the database lacks the full dictionary, load from file and append
                // missing words
                if (persistedWords.size() < 1000) {
                    System.out.println(
                            "📥 Database is missing the full dictionary. Loading from local dictionary.txt...");
                    java.io.InputStream is = getClass().getResourceAsStream("/dictionary.txt");
                    if (is != null) {
                        int newWordsAdded = 0;
                        try (java.util.Scanner scanner = new java.util.Scanner(is,
                                java.nio.charset.StandardCharsets.UTF_8)) {
                            while (scanner.hasNextLine()) {
                                String word = scanner.nextLine().trim().replaceAll("[^A-Z]", "");
                                if (word.length() == 5) {
                                    // Only persist if it wasn't already in the database (loaded in step 1)
                                    if (cacheOfValidWords.add(word)) {
                                        CachedWord cw = new CachedWord();
                                        cw.word = word;
                                        cw.persist();
                                        newWordsAdded++;
                                    }
                                }
                            }
                        }
                        System.out.println("✅ Inserted " + newWordsAdded + " new dictionary words into the database.");
                    } else {
                        System.err.println("❌ dictionary.txt not found in resources!");
                    }
                } else {
                    System.out.println(
                            "✅ WordService loaded " + cacheOfValidWords.size() + " words from the database cache.");
                }
            });
        } catch (Exception e) {
            System.err.println("❌ Failed to load cached words from database: " + e.getMessage());
        }
    }

    /**
     * Helper to retrieve the current count of cached words in memory.
     */
    public int getCacheSize() {
        return cacheOfValidWords.size();
    }

    /**
     * Strips accents/diacritics and non-alphabetic chars, returning an uppercase
     * string.
     */
    public static String stripAccents(String input) {
        if (input == null)
            return null;
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "").replaceAll("[^a-zA-Z]", "").toUpperCase();
    }

    /**
     * Helper to add a word to both the memory cache and the persistent database
     * cache.
     */
    @Transactional
    public void addToCache(String word) {
        String normalizedWord = stripAccents(word);
        if (normalizedWord != null && cacheOfValidWords.add(normalizedWord)) {
            // Check if it already exists in DB to prevent unique constraint violation
            if (CachedWord.findByWord(normalizedWord) == null) {
                CachedWord cw = new CachedWord();
                cw.word = normalizedWord;
                cw.persist();
            }
        }
    }

    /**
     * Pick a word based on the player's level by querying the AI.
     */
    public String getRandomWordForLevel(int level, String previousWord) {
        System.out.println("🤖 Querying Groq AI (Level " + level + ", Previous Word: " + previousWord + ")...");
        
        int maxAttempts = 3;
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                String word = wordGeneratorAI.generateNextWord(level, previousWord);
                if (word != null) {
                    String cleanWord = stripAccents(word);
                    // Validate that it's a 5-letter alphabetic word
                    if (cleanWord.length() == 5 && cleanWord.matches("[A-Z]+")) {
                        System.out.println("✅ AI generated a valid French word: '" + cleanWord + "' (original: '" + word + "')");
                        // Pre-cache it so it's recognized as a valid dictionary guess
                        addToCache(cleanWord);
                        return cleanWord;
                    }
                    System.err.println("⚠️ Attempt " + attempt + " failed. AI returned invalid format: '" + word + "'");
                }
            } catch (Exception e) {
                System.err.println("❌ AI call failed on attempt " + attempt + ": " + e.getMessage());
            }
        }
        
        System.err.println("🚨 All AI attempts failed.");
        throw new RuntimeException("AI word generation failed after " + maxAttempts + " attempts.");
    }

    /**
     * Check if a user's guessed word is valid against the local dictionary.
     * If not found locally, queries French Wiktionary API.
     */
    public boolean isValidWord(String word) {
        if (word == null || word.trim().length() != 5) {
            return false;
        }

        String normalizedWord = stripAccents(word);

        // We strictly check against our local French dictionary cache (which contains 330,000+ words)
        // We no longer fallback to Wiktionary because Wiktionary contains English words too.
        return cacheOfValidWords.contains(normalizedWord);
    }
}
