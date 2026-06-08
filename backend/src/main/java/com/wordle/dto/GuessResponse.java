package com.wordle.dto;

import java.util.List;

public record GuessResponse(
    boolean validWord,
    String errorMessage,
    GameStateResponse gameState,
    List<LetterClue> result
) {}
