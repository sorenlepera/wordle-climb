package com.wordle.service;

import com.wordle.dto.*;
import com.wordle.model.GameSession;
import com.wordle.model.GameStatus;
import com.wordle.model.PlayerProfile;
import io.quarkus.cache.CacheResult;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class GameService {

    @Inject
    WordService wordService;

    @Transactional
    public GameStateResponse startGame(String username) {
        // 1. Fetch or create Player Profile
        PlayerProfile profile = PlayerProfile.findByUsername(username);
        if (profile == null) {
            profile = new PlayerProfile();
            profile.username = username;
            profile.persist();
        }

        // 2. Fetch active session (either IN_PROGRESS or WON) or create a new one
        GameSession session = GameSession.find("username = ?1 and (status = ?2 or status = ?3)",
            username, GameStatus.IN_PROGRESS, GameStatus.WON).firstResult();
        if (session == null) {
            session = new GameSession();
            session.username = username;
            session.currentLevel = 1;
            session.targetWord = wordService.getRandomWordForLevel(1, "START");
            session.persist();
        }

        return buildGameState(session, profile);
    }

    @Transactional
    public GuessResponse submitGuess(String username, String guessWord) {
        PlayerProfile profile = PlayerProfile.findByUsername(username);
        GameSession session = GameSession.findActiveByUsername(username);

        if (profile == null || session == null) {
            throw new IllegalArgumentException("Aucune session de jeu active trouvée pour l'utilisateur. Appelez d'abord /start.");
        }

        if (guessWord.length() != 5) {
            return new GuessResponse(
                false,
                "Le mot doit comporter exactement 5 lettres",
                buildGameState(session, profile),
                Collections.emptyList()
            );
        }

        // Validate word against dictionary
        if (!wordService.isValidWord(guessWord)) {
            return new GuessResponse(
                false,
                "Ce mot n'est pas dans le dictionnaire",
                buildGameState(session, profile),
                Collections.emptyList()
            );
        }

        // Process valid guess
        List<LetterClue> evaluation = evaluateGuess(session.targetWord, guessWord);

        // Update guess list in session
        if (session.guesses.isEmpty()) {
            session.guesses = guessWord;
        } else {
            session.guesses = session.guesses + "," + guessWord;
        }
        session.guessCount++;

        boolean isCorrect = guessWord.equals(session.targetWord);

        if (isCorrect) {
            session.status = GameStatus.WON;

            profile.currentStreak++;
            if (session.currentLevel > profile.highScore) {
                profile.highScore = session.currentLevel;
            }

            int basePoints = switch (session.guessCount) {
                case 1 -> 1000;
                case 2 -> 800;
                case 3 -> 600;
                case 4 -> 400;
                case 5 -> 200;
                case 6 -> 100;
                default -> 0;
            };
            int levelPoints = basePoints * session.currentLevel;
            session.score += levelPoints;

            if (session.score > profile.maxScore) {
                profile.maxScore = session.score;
            }
        } else if (session.guessCount >= 6) {
            session.status = GameStatus.LOST;
            profile.currentStreak = 0;
        }

        return new GuessResponse(
            true,
            null,
            buildGameState(session, profile),
            evaluation
        );
    }

    @Transactional
    public GameStateResponse nextLevel(String username) {
        PlayerProfile profile = PlayerProfile.findByUsername(username);
        GameSession session = GameSession.find("username = ?1 and status = ?2", username, GameStatus.WON).firstResult();

        if (session == null || profile == null) {
            throw new IllegalArgumentException("Aucune session de niveau complété trouvée pour l'utilisateur.");
        }

        String solvedWord = session.targetWord;
        session.currentLevel++;
        session.targetWord = wordService.getRandomWordForLevel(session.currentLevel, solvedWord);
        session.guesses = "";
        session.guessCount = 0;
        session.status = GameStatus.IN_PROGRESS;

        return buildGameState(session, profile);
    }

    @CacheResult(cacheName = "leaderboard")
    public List<LeaderboardEntry> getLeaderboard() {
        return PlayerProfile.find("order by maxScore desc")
            .page(Page.ofSize(10))
            .<PlayerProfile>list()
            .stream()
            .map(p -> new LeaderboardEntry(p.username, p.highScore, p.maxScore))
            .collect(Collectors.toList());
    }

    public StatusResponse getSystemStatus() {
        String key = org.eclipse.microprofile.config.ConfigProvider.getConfig().getValue("quarkus.langchain4j.openai.api-key", String.class);
        boolean aiConnected = key != null && !key.trim().isEmpty() && !key.equals("DEMO_KEY");
        return new StatusResponse(
            aiConnected,
            aiConnected ? "llama3-8b" : "error",
            wordService.getCacheSize()
        );
    }

    private GameStateResponse buildGameState(GameSession session, PlayerProfile profile) {
        List<String> guessList = new ArrayList<>();
        if (session.guesses != null && !session.guesses.trim().isEmpty()) {
            guessList = Arrays.asList(session.guesses.split(","));
        }

        List<List<LetterClue>> clueHistory = new ArrayList<>();
        for (String g : guessList) {
            clueHistory.add(evaluateGuess(session.targetWord, g));
        }

        String revealedWord = null;
        if (session.status == GameStatus.WON || session.status == GameStatus.LOST) {
            revealedWord = session.targetWord;
        }

        return new GameStateResponse(
            session.id,
            session.username,
            session.currentLevel,
            session.guessCount,
            guessList,
            clueHistory,
            session.status,
            profile.highScore,
            profile.currentStreak,
            revealedWord,
            session.score,
            profile.maxScore
        );
    }

    public static List<LetterClue> evaluateGuess(String target, String guess) {
        char[] targetChars = target.toCharArray();
        char[] guessChars = guess.toCharArray();
        LetterClue[] clues = new LetterClue[5];
        boolean[] targetMatched = new boolean[5];
        boolean[] guessMatched = new boolean[5];

        for (int i = 0; i < 5; i++) {
            if (guessChars[i] == targetChars[i]) {
                clues[i] = new LetterClue(guessChars[i], "CORRECT");
                targetMatched[i] = true;
                guessMatched[i] = true;
            }
        }

        for (int i = 0; i < 5; i++) {
            if (guessMatched[i]) {
                continue;
            }

            boolean found = false;
            for (int j = 0; j < 5; j++) {
                if (!targetMatched[j] && targetChars[j] == guessChars[i]) {
                    clues[i] = new LetterClue(guessChars[i], "PRESENT");
                    targetMatched[j] = true;
                    found = true;
                    break;
                }
            }

            if (!found) {
                clues[i] = new LetterClue(guessChars[i], "ABSENT");
            }
        }

        return Arrays.asList(clues);
    }
}
