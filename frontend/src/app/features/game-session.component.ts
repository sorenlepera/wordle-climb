import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordGridComponent } from '../shared/components/word-grid.component';
import { KeyboardComponent } from '../shared/components/keyboard.component';
import { StatsModalComponent } from '../shared/components/stats-modal.component';
import { GameSidebarComponent } from '../shared/components/game-sidebar.component';
import { VictoryOverlayComponent } from '../shared/components/victory-overlay.component';
import { GameOverOverlayComponent } from '../shared/components/game-over-overlay.component';
import { GameStateService } from '../core/services/game-state.service';

@Component({
  selector: 'app-game-session',
  standalone: true,
  imports: [
    CommonModule, 
    WordGridComponent, 
    KeyboardComponent, 
    StatsModalComponent,
    GameSidebarComponent,
    VictoryOverlayComponent,
    GameOverOverlayComponent
  ],
  template: `
    <div class="game-layout fade-in">
      
      <!-- PLAYER RUN STATS SIDEBAR -->
      <app-game-sidebar
        [currentLevel]="gameStateService.gameState()?.currentLevel"
        [score]="gameStateService.gameState()?.score"
        [currentStreak]="gameStateService.gameState()?.currentStreak"
        [maxScore]="gameStateService.gameState()?.maxScore"
        (showStats)="showStats = true">
      </app-game-sidebar>

      <!-- GAME BOARD CONTAINER -->
      <main class="game-board-container">
        @if (gameStateService.gameState()?.status === 'IN_PROGRESS' || gameStateService.gameState()?.status === 'WON') {
          <app-word-grid 
            [state]="gameStateService.gameState()" 
            [currentGuess]="gameStateService.currentGuess()" 
            [shakeRowIndex]="gameStateService.shakeRowIndex()" 
            [revealingRowIndex]="gameStateService.revealingRowIndex()">
          </app-word-grid>

          @if (gameStateService.gameState()?.status === 'IN_PROGRESS') {
            <app-keyboard 
              [disabled]="gameStateService.isGuessSubmitting() || gameStateService.revealingRowIndex() !== -1"
              [letterStatuses]="letterStatuses"
              (keyClick)="onVirtualKeyClick($event)">
            </app-keyboard>
          } @else if (gameStateService.gameState()?.status === 'WON' && gameStateService.showVictory()) {
            <!-- VICTORY SCREEN OVERLAY -->
            <app-victory-overlay
              [targetWord]="gameStateService.gameState()?.targetWord"
              [lastLevelWord]="gameStateService.lastLevelWord()"
              [currentLevel]="gameStateService.gameState()?.currentLevel"
              [score]="gameStateService.gameState()?.score"
              [currentStreak]="gameStateService.gameState()?.currentStreak"
              (proceedToNext)="gameStateService.proceedToNextLevel()">
            </app-victory-overlay>
          }
        }

        <!-- RUN OVER / LOSS INTERFACE -->
        @if (gameStateService.gameState()?.status === 'LOST') {
          <app-game-over-overlay
            [currentLevel]="gameStateService.gameState()?.currentLevel"
            [currentStreak]="gameStateService.gameState()?.currentStreak"
            [targetWord]="gameStateService.gameState()?.targetWord"
            [score]="gameStateService.gameState()?.score"
            [maxScore]="gameStateService.gameState()?.maxScore"
            [highScore]="gameStateService.gameState()?.highScore"
            (resetRun)="gameStateService.resetRun()"
            (exitGame)="gameStateService.exitGame()">
          </app-game-over-overlay>
        }
      </main>

      @if (showStats) {
        <app-stats-modal
          [stats]="gameStateService.playerStats()"
          (close)="showStats = false">
        </app-stats-modal>
      }
    </div>
  `,
  styles: [`
    .game-layout {
      position: relative;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      gap: 3rem;
      width: 100%;
      max-width: 800px;
      margin: auto;
    }
    .game-board-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: min(2vh, 1.25rem);
      width: 100%;
      max-width: 460px;
    }
    @media (max-width: 768px) {
      .game-layout {
        flex-direction: column;
        align-items: center;
        gap: min(2vh, 1rem);
      }
    }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class GameSessionComponent {
  gameStateService = inject(GameStateService);
  showStats = false;
  
  get letterStatuses(): Record<string, 'CORRECT' | 'PRESENT' | 'ABSENT' | null> {
    const statuses: Record<string, 'CORRECT' | 'PRESENT' | 'ABSENT' | null> = {};
    const state = this.gameStateService.gameState();
    if (!state?.letterClues) return statuses;
    
    for (const row of state.letterClues) {
      for (const clue of row) {
        const key = clue.letter.toUpperCase();
        if (clue.status === 'CORRECT') {
          statuses[key] = 'CORRECT';
        } else if (clue.status === 'PRESENT' && statuses[key] !== 'CORRECT') {
          statuses[key] = 'PRESENT';
        } else if (clue.status === 'ABSENT' && !statuses[key]) {
          statuses[key] = 'ABSENT';
        }
      }
    }
    return statuses;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const key = event.key.toUpperCase();

    if (this.gameStateService.gameState()?.status === 'WON' && this.gameStateService.showVictory()) {
      if (key === 'ENTER') {
        this.gameStateService.proceedToNextLevel();
      }
      return;
    }

    if (!this.gameStateService.gameState() || this.gameStateService.gameState()?.status !== 'IN_PROGRESS' || this.gameStateService.revealingRowIndex() !== -1 || this.gameStateService.isGuessSubmitting()) {
      return;
    }


    if (key === 'ENTER') {
      this.gameStateService.submitGuess();
    } else if (key === 'BACKSPACE') {
      this.gameStateService.deleteLastLetter();
    } else if (/^[A-Z]$/.test(key)) {
      this.gameStateService.typeLetter(key);
    }
  }

  onVirtualKeyClick(key: string) {
    if (!this.gameStateService.gameState() || this.gameStateService.gameState()?.status !== 'IN_PROGRESS' || this.gameStateService.revealingRowIndex() !== -1 || this.gameStateService.isGuessSubmitting()) {
      return;
    }

    if (key === 'ENTER') {
      this.gameStateService.submitGuess();
    } else if (key === 'BACKSPACE') {
      this.gameStateService.deleteLastLetter();
    } else {
      this.gameStateService.typeLetter(key);
    }
  }
}
