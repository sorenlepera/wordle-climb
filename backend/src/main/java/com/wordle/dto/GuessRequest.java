package com.wordle.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GuessRequest(
    @NotNull(message = "Guess word is required")
    @Size(min = 5, max = 5, message = "Le mot doit comporter exactement 5 lettres")
    String word
) {}
