package com.wordle.dto;

import com.wordle.model.GameStatus;
import java.util.List;

public record GameStateResponse(
    Long sessionId,
    String username,
    int currentLevel,
    int guessCount,
    List<String> guesses,
    List<List<LetterClue>> letterClues,
    GameStatus status,
    int highScore,
    int currentStreak,
    String targetWord,
    int score,
    int maxScore
) {}
