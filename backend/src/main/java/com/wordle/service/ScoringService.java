package com.wordle.service;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ScoringService {

    public int calculatePoints(int guessCount, int currentLevel) {
        int basePoints = switch (guessCount) {
            case 1 -> 1000;
            case 2 -> 800;
            case 3 -> 600;
            case 4 -> 400;
            case 5 -> 200;
            case 6 -> 100;
            default -> 0;
        };
        return basePoints * currentLevel;
    }
}
