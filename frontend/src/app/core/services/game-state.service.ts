import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppStatus, GameState, LeaderboardEntry, PlayerStats } from '../models/game.model';
import { GameService } from './game.service';
import { AudioService } from './audio.service';
import { PlayerStatsService } from './player-stats.service';
import { AnimationService } from './animation.service';

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private readonly gameService = inject(GameService);
  private readonly router = inject(Router);
  private readonly audioService = inject(AudioService);
  private readonly playerStatsService = inject(PlayerStatsService);
  private readonly animationService = inject(AnimationService);

  currentGuess = signal<string>('');
  gameState = signal<GameState | null>(null);
  leaderboard = signal<LeaderboardEntry[]>([]);
  aiStatus = signal<AppStatus | null>(null);
  
  errorMessage = signal<string>('');
  showError = signal<boolean>(false);
  shakeRowIndex = signal<number>(-1);
  levelUpSuccess = signal<boolean>(false);
  lastLevelWord = signal<string>('');
  isAiLoading = signal<boolean>(false);
  revealingRowIndex = signal<number>(-1);
  showVictory = signal<boolean>(false);
  isGuessSubmitting = signal<boolean>(false);
  get playerStats() {
    return this.playerStatsService.playerStats;
  }

  checkAiStatus() {
    this.gameService.getStatus().subscribe({
      next: (status) => this.aiStatus.set(status),
      error: (err) => console.error('Failed to load AI status', err)
    });
  }

  loadLeaderboard() {
    this.gameService.getLeaderboard().subscribe({
      next: (data) => this.leaderboard.set(data),
      error: (err) => console.error('Failed to load leaderboard', err)
    });
  }

  async enterGame(): Promise<void> {
    this.isAiLoading.set(true);
    return new Promise((resolve, reject) => {
      this.gameService.startGame().subscribe({
        next: (state) => {
          this.gameState.set(state);
          
          // Track new run start
          if (state.currentLevel === 1 && state.guessCount === 0 && state.status === 'IN_PROGRESS') {
            this.playerStatsService.recordRunStart();
          }

          this.currentGuess.set('');
          this.errorMessage.set('');
          this.isAiLoading.set(false);
          this.revealingRowIndex.set(-1);
          this.showVictory.set(state.status === 'WON');
          // Navigate to the game session screen
          this.router.navigate(['/play']).then(() => resolve());
        },
        error: (err) => {
          console.error('Failed to start game', err);
          this.isAiLoading.set(false);
          const msg = err.error?.message || "Une erreur de connexion est survenue.";
          reject(new Error(msg));
        }
      });
    });
  }

  exitGame() {
    this.gameState.set(null);
    this.currentGuess.set('');
    this.loadLeaderboard();
    this.checkAiStatus();
    // Navigate back to lobby
    this.router.navigate(['/lobby']);
  }

  proceedToNextLevel() {
    const state = this.gameState();
    if (!state) return;

    this.audioService.playLevelUpSound();
    this.isAiLoading.set(true);
    this.gameService.nextLevel().subscribe({
      next: (nextState) => {
        this.gameState.set(nextState);
        this.currentGuess.set('');
        this.errorMessage.set('');
        this.isAiLoading.set(false);
        this.revealingRowIndex.set(-1);
        this.showVictory.set(false);
      },
      error: (err) => {
        console.error('Failed to advance level', err);
        this.isAiLoading.set(false);
        const msg = err.error?.message || "Impossible de passer au niveau suivant.";
        this.triggerErrorShake(msg);
      }
    });
  }

  typeLetter(letter: string) {
    if (this.currentGuess().length < 5) {
      this.currentGuess.update(g => g + letter);
      this.audioService.playTypeSound();
    }
  }

  deleteLastLetter() {
    if (this.currentGuess().length > 0) {
      this.currentGuess.update(g => g.slice(0, -1));
      this.audioService.playDeleteSound();
    }
  }

  submitGuess() {
    const guess = this.currentGuess().toUpperCase();
    const state = this.gameState();
    
    if (!state) return;

    if (guess.length !== 5) {
      this.triggerErrorShake("Le mot doit comporter 5 lettres");
      return;
    }

    const submittedRowIndex = state.guessCount;

    this.isGuessSubmitting.set(true);

    this.gameService.submitGuess(guess).subscribe({
      next: (response) => {
        this.isGuessSubmitting.set(false);
        if (!response.validWord) {
          this.triggerErrorShake(response.errorMessage || "Invalid word");
          return;
        }

        this.revealingRowIndex.set(submittedRowIndex);
        
        if (response.result) {
          response.result.forEach((clue, idx) => {
            // TypeScript types status as string, but AudioService expects 'CORRECT'|'PRESENT'|'ABSENT'
            this.audioService.playRevealSound(clue.status as any, idx);
          });
        }

        const nextState = response.gameState;
        this.gameState.set(nextState);
        this.currentGuess.set('');

        if (nextState.status === 'WON') {
          this.showVictory.set(false);
          this.triggerLevelUpAnimation(guess);
          this.animationService.triggerConfetti();
          setTimeout(() => {
            this.audioService.playWinSound();
          }, 800);
          setTimeout(() => {
            this.showVictory.set(true);
            this.revealingRowIndex.set(-1);
          }, 1500);
        } else if (nextState.status === 'LOST') {
          this.playerStatsService.recordDeath(nextState.currentLevel);
          this.loadLeaderboard();
        } else {
          setTimeout(() => {
            if (this.revealingRowIndex() === submittedRowIndex) {
              this.revealingRowIndex.set(-1);
            }
          }, 800);
        }

        if (nextState.status === 'LOST') {
          this.loadLeaderboard();
        }
      },
      error: (err) => {
        this.isGuessSubmitting.set(false);
        console.error('Failed to submit guess', err);
        // We do not trigger the error shake manually here anymore because the HTTP Interceptor will handle it.
      }
    });
  }

  triggerErrorShake(msg: string) {
    this.errorMessage.set(msg);
    this.showError.set(true);
    this.audioService.playErrorSound();
    
    const activeRowIndex = this.gameState()?.guessCount || 0;
    this.shakeRowIndex.set(activeRowIndex);

    setTimeout(() => {
      this.showError.set(false);
      this.shakeRowIndex.set(-1);
    }, 2000);
  }

  triggerLevelUpAnimation(solvedWord: string) {
    this.lastLevelWord.set(solvedWord);
    this.levelUpSuccess.set(true);
    setTimeout(() => {
      this.levelUpSuccess.set(false);
    }, 3000);
  }

  resetRun() {
    const state = this.gameState();
    if (state) {
      this.enterGame();
    }
  }
}
