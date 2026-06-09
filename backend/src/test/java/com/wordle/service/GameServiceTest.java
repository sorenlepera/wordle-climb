package com.wordle.service;

import com.wordle.dto.LetterClue;
import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.assertEquals;

class GameServiceTest {

    @Test
    void testAllCorrect() {
        List<LetterClue> clues = GameService.evaluateGuess("APPLE", "APPLE");
        assertEquals(5, clues.size());
        for (LetterClue clue : clues) {
            assertEquals("CORRECT", clue.state());
        }
    }

    @Test
    void testAllAbsent() {
        List<LetterClue> clues = GameService.evaluateGuess("APPLE", "GHOST");
        assertEquals(5, clues.size());
        for (LetterClue clue : clues) {
            assertEquals("ABSENT", clue.state());
        }
    }

    @Test
    void testMixed() {
        List<LetterClue> clues = GameService.evaluateGuess("PAPER", "PARTS");
        // P A P E R
        // P A R T S
        // P -> CORRECT
        // A -> CORRECT
        // R -> PRESENT
        // T -> ABSENT
        // S -> ABSENT
        assertEquals("CORRECT", clues.get(0).state());
        assertEquals("CORRECT", clues.get(1).state());
        assertEquals("PRESENT", clues.get(2).state());
        assertEquals("ABSENT", clues.get(3).state());
        assertEquals("ABSENT", clues.get(4).state());
    }

    @Test
    void testDoubleLetterInTargetSingleInGuess() {
        List<LetterClue> clues = GameService.evaluateGuess("APPLE", "PLANT");
        // A P P L E
        // P L A N T
        // P -> PRESENT (matches one of the Ps)
        // L -> PRESENT (matches the L)
        // A -> PRESENT (matches the A)
        // N -> ABSENT
        // T -> ABSENT
        assertEquals("PRESENT", clues.get(0).state());
        assertEquals("PRESENT", clues.get(1).state());
        assertEquals("PRESENT", clues.get(2).state());
        assertEquals("ABSENT", clues.get(3).state());
        assertEquals("ABSENT", clues.get(4).state());
    }

    @Test
    void testSingleLetterInTargetDoubleInGuess() {
        List<LetterClue> clues = GameService.evaluateGuess("PLANT", "APPLE");
        // P L A N T
        // A P P L E
        // A -> PRESENT
        // P -> PRESENT (matches the only P)
        // P -> ABSENT (no more Ps left in target)
        // L -> PRESENT
        // E -> ABSENT
        assertEquals("PRESENT", clues.get(0).state());
        assertEquals("PRESENT", clues.get(1).state());
        assertEquals("ABSENT", clues.get(2).state());
        assertEquals("PRESENT", clues.get(3).state());
        assertEquals("ABSENT", clues.get(4).state());
    }

    @Test
    void testDoubleLetterOneCorrectOnePresent() {
        List<LetterClue> clues = GameService.evaluateGuess("PAPER", "APPLE");
        // P A P E R
        // A P P L E
        // A -> PRESENT (matches A at pos 1)
        // P -> PRESENT (matches P at pos 0)
        // P -> CORRECT (matches P at pos 2)
        // L -> ABSENT
        // E -> PRESENT (matches E at pos 3)
        assertEquals("PRESENT", clues.get(0).state());
        assertEquals("PRESENT", clues.get(1).state());
        assertEquals("CORRECT", clues.get(2).state());
        assertEquals("ABSENT", clues.get(3).state());
        assertEquals("PRESENT", clues.get(4).state());
    }
}
