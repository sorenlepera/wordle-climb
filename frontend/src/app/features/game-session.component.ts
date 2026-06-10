import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordGridComponent } from '../shared/components/word-grid.component';
import { KeyboardComponent } from '../shared/components/keyboard.component';
import { StatsModalComponent } from '../shared/components/stats-modal.component';
import { GameStateService } from '../core/services/game-state.service';

@Component({
  selector: 'app-game-session',
  standalone: true,
  imports: [CommonModule, WordGridComponent, KeyboardComponent, StatsModalComponent],
  template: `
    <div class="game-layout fade-in">
      
      <!-- PLAYER RUN STATS SIDEBAR -->
      <aside class="game-stats-sidebar">
        <div class="stat-box">
          <span class="stat-label">NIVEAU</span>
          <span class="stat-value level-value">Niv {{ gameStateService.gameState()?.currentLevel }}</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">SCORE</span>
          <span class="stat-value level-value">{{ gameStateService.gameState()?.score }} pts</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">SÉRIE</span>
          <span class="stat-value streak-value">{{ gameStateService.gameState()?.currentStreak }} 🔥</span>
        </div>
        <div class="stat-box">
          <span class="stat-label">RECORD</span>
          <span class="stat-value record-value">{{ gameStateService.gameState()?.maxScore }} pts</span>
        </div>
        
        <button class="stats-btn" (click)="showStats = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="3" width="4" height="18"></rect><rect x="10" y="8" width="4" height="13"></rect><rect x="2" y="13" width="4" height="8"></rect></svg>
        </button>
      </aside>

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
            <div class="victory-overlay">
              <div class="victory-container modal-slide">
                <div class="victory-emoji">🎉</div>
                <h2>NIVEAU RÉUSSI&nbsp;!</h2>
                <p class="victory-text">
                  Vous avez trouvé le mot du niveau : <strong class="revealed-word">{{ gameStateService.gameState()?.targetWord || gameStateService.lastLevelWord() }}</strong>
                </p>
                <div class="summary-details">
                  <div class="detail-row">
                    <span>Niveau complété :</span>
                    <strong>Niveau {{ gameStateService.gameState()?.currentLevel }}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Score cumulé :</span>
                    <strong>{{ gameStateService.gameState()?.score }} pts</strong>
                  </div>
                  <div class="detail-row">
                    <span>Série actuelle :</span>
                    <strong>{{ gameStateService.gameState()?.currentStreak }} 🔥</strong>
                  </div>
                </div>
                <div class="action-buttons">
                  <button class="btn-primary" (click)="gameStateService.proceedToNextLevel()">
                    PASSER AU NIVEAU {{ (gameStateService.gameState()?.currentLevel || 0) + 1 }}
                  </button>
                </div>
              </div>
            </div>
          }
        }

        <!-- RUN OVER / LOSS INTERFACE -->
        @if (gameStateService.gameState()?.status === 'LOST') {
          <div class="run-over-container modal-slide">
            <div class="loss-emoji">💀</div>
            <h2>PARTIE TERMINÉE</h2>
            <p class="run-over-text">
              Vous n'avez pas réussi à deviner le mot du <strong>Niveau {{ gameStateService.gameState()?.currentLevel }}</strong>.
              Votre série de <strong>{{ gameStateService.gameState()?.currentStreak }}</strong> est terminée.
            </p>
            @if (gameStateService.gameState()?.targetWord) {
              <p class="revealed-word-text">
                Le mot était : <strong class="revealed-word">{{ gameStateService.gameState()?.targetWord }}</strong>
              </p>
            }
            <div class="summary-details">
              <div class="detail-row">
                <span>Score final :</span>
                <strong>{{ gameStateService.gameState()?.score }} pts</strong>
              </div>
              <div class="detail-row">
                <span>Meilleur score :</span>
                <strong>{{ gameStateService.gameState()?.maxScore }} pts</strong>
              </div>
              <div class="detail-row">
                <span>Niveau maximal atteint :</span>
                <strong>Niveau {{ gameStateService.gameState()?.highScore }}</strong>
              </div>
            </div>
            <div class="action-buttons">
              <button class="btn-primary" (click)="gameStateService.resetRun()">
                RECOMMENCER (NIVEAU 1)
              </button>
              <button class="btn-secondary" (click)="gameStateService.exitGame()">
                RETOUR AU SALON
              </button>
            </div>
          </div>
        }
      </main>

      @if (showStats) {
        <app-stats-modal
          [distribution]="gameStateService.guessDistribution()"
          [currentStreak]="gameStateService.gameState()?.currentStreak || 0"
          [maxStreak]="gameStateService.gameState()?.maxScore || 0"
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
    .game-stats-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      background: rgba(10, 10, 16, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
      padding: 1.8rem 1.4rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      min-width: 140px;
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
    .stat-box {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      position: relative;
      width: 100%;
    }
    .stat-box:not(:last-child)::after {
      content: '';
      position: absolute;
      bottom: -0.75rem; left: 0; height: 1px; width: 100%;
      background: rgba(255, 255, 255, 0.08);
    }
    @media (max-width: 768px) {
      .game-layout {
        flex-direction: column;
        align-items: center;
        gap: min(2vh, 1rem);
      }
      .game-stats-sidebar {
        flex-direction: row;
        width: 100%;
        max-width: 460px;
        justify-content: space-between;
        padding: min(1.2vh, 0.8rem) 1.2rem;
        gap: 0.5rem;
      }
      .stat-box {
        align-items: center;
      }
      .stat-box:not(:last-child)::after {
        content: '';
        position: absolute;
        right: -5px; top: 15%; height: 70%; width: 1px; bottom: auto; left: auto;
        background: rgba(255, 255, 255, 0.08);
      }
    }
    .stat-label { font-size: 0.68rem; color: #64748b; font-weight: 800; letter-spacing: 0.06em; margin-bottom: 0.15rem; }
    .stat-value { font-family: 'Space Grotesk', sans-serif; font-size: 1.3rem; font-weight: 800; }
    .level-value { color: #00f2fe; text-shadow: 0 0 10px rgba(0, 242, 254, 0.15); }
    .streak-value { color: #f59e0b; text-shadow: 0 0 10px rgba(245, 158, 11, 0.15); }
    .record-value { color: #e2e8f0; }
    
    .stats-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      border-radius: 8px;
      padding: 0.5rem;
      cursor: pointer;
      display: flex; justify-content: center; align-items: center;
      transition: all 0.2s;
      width: 100%;
      margin-top: 0.5rem;
    }
    .stats-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .victory-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; justify-content: center; align-items: center;
      background: rgba(4, 4, 8, 0.65); backdrop-filter: blur(8px);
      z-index: 9999;
    }
    .victory-container, .run-over-container {
      background: rgba(10, 10, 16, 0.85); backdrop-filter: blur(24px);
      border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 24px;
      padding: 3rem 2.25rem; text-align: center;
      box-shadow: 0 35px 70px rgba(0, 0, 0, 0.65), 0 0 30px rgba(16, 185, 129, 0.05);
      width: 90%; max-width: 400px;
      display: flex; flex-direction: column; align-items: center; gap: 1.6rem;
    }
    .run-over-container {
      border-color: rgba(239, 68, 68, 0.25);
      box-shadow: 0 35px 70px rgba(0, 0, 0, 0.65), 0 0 30px rgba(239, 68, 68, 0.05);
      width: 100%; max-width: none; margin-top: auto; margin-bottom: auto;
    }
    .victory-emoji, .loss-emoji { font-size: 3.8rem; animation: heartbeat 1.5s infinite; }
    h2 {
      font-family: 'Space Grotesk', sans-serif; font-size: 2.2rem; font-weight: 800; margin: 0; letter-spacing: 0.04em;
    }
    .victory-container h2 {
      background: linear-gradient(135deg, #10b981, #34d399);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .run-over-container h2 {
      background: linear-gradient(135deg, #ef4444, #f87171);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .victory-text, .run-over-text { color: #cbd5e1; font-size: 1.05rem; line-height: 1.65; margin: 0; }
    .revealed-word-text { color: #94a3b8; font-size: 1.05rem; margin: 0.5rem 0 0 0; }
    .revealed-word {
      color: #f87171; font-size: 1.4rem; letter-spacing: 0.08em; font-family: 'Space Grotesk', sans-serif;
      background: rgba(239, 68, 68, 0.12); padding: 0.4rem 1rem; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.22);
      font-weight: 700; display: inline-block; margin-top: 0.3rem; box-shadow: 0 0 15px rgba(239, 68, 68, 0.1);
    }
    .summary-details {
      background: rgba(0, 0, 0, 0.22); width: 100%; border-radius: 10px; padding: 1.1rem;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .detail-row { display: flex; justify-content: space-between; font-size: 0.98rem; }
    .detail-row span { color: #94a3b8; }
    .detail-row strong { color: #00f2fe; font-family: 'Space Grotesk', sans-serif; }
    .action-buttons { display: flex; flex-direction: column; gap: 0.85rem; width: 100%; }
    button {
      font-family: 'Space Grotesk', sans-serif; font-weight: 700; border-radius: 10px; cursor: pointer;
      transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1); border: none; text-transform: uppercase; letter-spacing: 0.04em;
    }
    .btn-primary {
      background: linear-gradient(135deg, #00f2fe, #4facfe); color: #030712; padding: 0.95rem 2rem; font-weight: 800;
      box-shadow: 0 0 20px rgba(0, 242, 254, 0.25); font-size: 0.95rem; width: 100%;
    }
    .btn-primary:hover {
      transform: translateY(-2px); box-shadow: 0 0 30px rgba(0, 242, 254, 0.45), 0 0 10px rgba(79, 70, 229, 0.2);
      background: linear-gradient(135deg, #38ef7d, #11998e);
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.03); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.07);
      padding: 0.95rem; font-size: 0.82rem; width: 100%;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08); color: #ffffff; border-color: rgba(255, 255, 255, 0.15);
    }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    .modal-slide { animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes heartbeat { 0% { transform: scale(1); } 14% { transform: scale(1.15); } 28% { transform: scale(1); } 42% { transform: scale(1.15); } 70% { transform: scale(1); } }
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
