import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState } from '../../core/models/game.model';

@Component({
  selector: 'app-word-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid-board">
      @for (rowIdx of [0, 1, 2, 3, 4, 5]; track rowIdx) {
        <div 
          class="grid-row" 
          [class.row-shake]="shakeRowIndex === rowIdx"
          [class.row-active]="state?.guessCount === rowIdx"
        >
          @for (colIdx of [0, 1, 2, 3, 4]; track colIdx) {
            <div 
              class="tile" 
              [ngClass]="getTileClass(rowIdx, colIdx)"
              [class.tile-revealing]="revealingRowIndex === rowIdx"
              [class.tile-winner]="revealingRowIndex === rowIdx && state?.status === 'WON'"
            >
              {{ getTileLetter(rowIdx, colIdx) }}
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .grid-board {
      display: flex;
      flex-direction: column;
      gap: min(1vh, 8px);
    }
    .grid-row {
      display: flex;
      gap: min(1vh, 8px);
    }
    .tile {
      width: min(15vw, 8.5vh, 58px);
      height: min(15vw, 8.5vh, 58px);
      background: rgba(30, 41, 59, 0.18);
      border: 2px solid rgba(255, 255, 255, 0.07);
      border-radius: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Space Grotesk', sans-serif;
      font-size: min(8vw, 4.5vh, 1.85rem);
      font-weight: 700;
      text-transform: uppercase;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
    }
    @media (max-width: 400px) {
      .tile { border-radius: 8px; }
    }
    .tile-filled {
      border-color: #00f2fe;
      animation: tile-pop 0.12s ease-in-out forwards;
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.15);
    }
    @keyframes tile-pop {
      0% { transform: scale(1); border-color: rgba(255, 255, 255, 0.07); }
      50% { transform: scale(1.15); border-color: #00f2fe; }
      100% { transform: scale(1.05); border-color: #00f2fe; }
    }
    .tile-correct {
      background-color: #10b981;
      border-color: #10b981;
      color: #ffffff;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.22);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
    }
    .tile-present {
      background-color: #f59e0b;
      border-color: #f59e0b;
      color: #ffffff;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.22);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
    }
    .tile-absent {
      background-color: #1e293b;
      border-color: #1e293b;
      color: #64748b;
      opacity: 0.7;
    }
    .tile-empty { }
    .tile-skeleton {
      background: rgba(30, 41, 59, 0.25);
      border-color: rgba(255, 255, 255, 0.03);
      position: relative;
      overflow: hidden;
    }
    .tile-skeleton::before {
      content: "";
      position: absolute;
      top: 0; left: -150%; width: 150%; height: 100%;
      background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 50%, transparent 100%);
      animation: shimmer 1.5s infinite;
    }
    .row-shake {
      animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    }
    @keyframes shake {
      10%, 90% { transform: translate3d(-2px, 0, 0); }
      20%, 80% { transform: translate3d(4px, 0, 0); }
      30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
      40%, 60% { transform: translate3d(6px, 0, 0); }
    }
    .tile-revealing:nth-child(1) { animation-delay: 0ms; }
    .tile-revealing:nth-child(2) { animation-delay: 80ms; }
    .tile-revealing:nth-child(3) { animation-delay: 160ms; }
    .tile-revealing:nth-child(4) { animation-delay: 240ms; }
    .tile-revealing:nth-child(5) { animation-delay: 320ms; }
    .tile-revealing.tile-correct { animation: tile-reveal-correct 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
    .tile-revealing.tile-present { animation: tile-reveal-present 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
    .tile-revealing.tile-absent { animation: tile-reveal-absent-fade 0.3s ease-out both; }
    .tile-winner:nth-child(1) { animation: tile-reveal-correct 0.3s 0ms both, tile-bounce 0.4s ease-in-out 600ms forwards; }
    .tile-winner:nth-child(2) { animation: tile-reveal-correct 0.3s 80ms both, tile-bounce 0.4s ease-in-out 680ms forwards; }
    .tile-winner:nth-child(3) { animation: tile-reveal-correct 0.3s 160ms both, tile-bounce 0.4s ease-in-out 760ms forwards; }
    .tile-winner:nth-child(4) { animation: tile-reveal-correct 0.3s 240ms both, tile-bounce 0.4s ease-in-out 840ms forwards; }
    .tile-winner:nth-child(5) { animation: tile-reveal-correct 0.3s 320ms both, tile-bounce 0.4s ease-in-out 920ms forwards; }
    @keyframes tile-reveal-correct {
      0% { transform: scale(1); background-color: transparent; border-color: rgba(255, 255, 255, 0.07); color: #ffffff; }
      50% { transform: scale(1.2); background-color: #10b981; border-color: #10b981; color: #ffffff; box-shadow: 0 0 25px rgba(16, 185, 129, 0.35); }
      100% { transform: scale(1); background-color: #10b981; border-color: #10b981; color: #ffffff; box-shadow: 0 0 15px rgba(16, 185, 129, 0.22); }
    }
    @keyframes tile-reveal-present {
      0% { transform: scale(1); background-color: transparent; border-color: rgba(255, 255, 255, 0.07); color: #ffffff; }
      50% { transform: scale(1.2); background-color: #f59e0b; border-color: #f59e0b; color: #ffffff; box-shadow: 0 0 25px rgba(245, 158, 11, 0.35); }
      100% { transform: scale(1); background-color: #f59e0b; border-color: #f59e0b; color: #ffffff; box-shadow: 0 0 15px rgba(245, 158, 11, 0.22); }
    }
    @keyframes tile-reveal-absent-fade {
      0% { background-color: transparent; border-color: rgba(255, 255, 255, 0.07); color: #ffffff; }
      100% { background-color: #1e293b; border-color: #1e293b; color: #64748b; }
    }
    @keyframes tile-bounce {
      0% { transform: translateY(0); }
      40% { transform: translateY(-15px); }
      60% { transform: translateY(0); }
      80% { transform: translateY(-5px); }
      100% { transform: translateY(0); }
    }
  `]
})
export class WordGridComponent {
  @Input() state: GameState | null = null;
  @Input() currentGuess: string = '';
  @Input() shakeRowIndex: number = -1;
  @Input() revealingRowIndex: number = -1;

  getTileLetter(rowIndex: number, colIndex: number): string {
    if (!this.state) return '';
    if (rowIndex < this.state.guessCount) {
      return this.state.guesses[rowIndex]?.[colIndex] || '';
    }
    if (rowIndex === this.state.guessCount && this.state.status === 'IN_PROGRESS') {
      return this.currentGuess[colIndex] || '';
    }
    return '';
  }

  getTileClass(rowIndex: number, colIndex: number): string {
    if (!this.state) return 'tile-empty';
    if (rowIndex < this.state.guessCount) {
      const clue = this.state.letterClues[rowIndex]?.[colIndex];
      if (!clue) return 'tile-empty';
      switch (clue.status) {
        case 'CORRECT': return 'tile-correct';
        case 'PRESENT': return 'tile-present';
        case 'ABSENT': return 'tile-absent';
      }
    }
    if (rowIndex === this.state.guessCount && this.state.status === 'IN_PROGRESS') {
      const hasLetter = this.currentGuess[colIndex] !== undefined;
      return hasLetter ? 'tile-filled' : 'tile-empty';
    }
    return 'tile-empty';
  }
}
