package com.wordle.model;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Entity
public class GameSession extends PanacheEntity {

    @Column(nullable = false)
    public String username;

    @Column(name = "current_level")
    public int currentLevel = 1;

    @Column(name = "score")
    public int score = 0;

    @Column(name = "target_word", nullable = false)
    public String targetWord;

    // Comma-separated list of guessed words (e.g. "APPLE,TIGER")
    @Column(length = 100)
    public String guesses = "";

    @Column(name = "guess_count")
    public int guessCount = 0;

    @Enumerated(EnumType.STRING)
    public GameStatus status = GameStatus.IN_PROGRESS;

    public static final int MAX_GUESSES = 6;
    public static final int REQUIRED_WORD_LENGTH = 5;

    /**
     * Find the single active game in progress for a given user.
     */
    public static GameSession findActiveByUsername(String username) {
        return find("username = ?1 and status = ?2", username, GameStatus.IN_PROGRESS).firstResult();
    }

    public void addGuess(String guessWord) {
        if (this.guesses == null || this.guesses.isEmpty()) {
            this.guesses = guessWord;
        } else {
            this.guesses = this.guesses + "," + guessWord;
        }
        this.guessCount++;
    }

    public boolean hasUsedAllGuesses() {
        return this.guessCount >= MAX_GUESSES;
    }

    public boolean isCorrectGuess(String guessWord) {
        return guessWord != null && guessWord.equals(this.targetWord);
    }

    public void markAsWon() {
        this.status = GameStatus.WON;
    }

    public void markAsLost() {
        this.status = GameStatus.LOST;
    }
}
