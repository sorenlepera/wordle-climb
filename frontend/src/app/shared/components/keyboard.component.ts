import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-keyboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="keyboard-container" [style.opacity]="disabled ? '0.4' : '1'" [style.pointer-events]="disabled ? 'none' : 'auto'">
      @for (row of keyboardRows; track row) {
        <div class="keyboard-row">
          @for (key of row; track key) {
            <button 
              (click)="keyClick.emit(key)"
              [class]="getKeyClass(key)"
              [class.key-action]="key === 'ENTER' || key === 'BACKSPACE'"
            >
              @if (key === 'BACKSPACE') {
                ⌫
              } @else if (key === 'ENTER') {
                ENTRÉE
              } @else {
                {{ key }}
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .keyboard-container {
      display: flex;
      flex-direction: column;
      gap: 7px;
      width: 100%;
      margin-top: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .keyboard-row {
      display: flex;
      justify-content: center;
      gap: 5px;
    }
    .keyboard-row button {
      height: min(7vh, 48px);
      flex: 1;
      max-width: 42px;
      background-color: rgba(30, 41, 59, 0.35);
      border: 1px solid rgba(255, 255, 255, 0.04);
      color: #e2e8f0;
      font-family: 'Space Grotesk', sans-serif;
      font-size: min(4vw, 2.5vh, 1rem);
      font-weight: 700;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 6px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.15);
      transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
      cursor: pointer;
    }
    .keyboard-row button.key-action {
      max-width: 70px;
      font-size: min(3.5vw, 2vh, 0.72rem);
      background-color: rgba(30, 41, 59, 0.55);
    }
    .keyboard-row button:hover {
      background-color: rgba(99, 102, 241, 0.22);
      border-color: rgba(99, 102, 241, 0.45);
      color: #ffffff;
      transform: translateY(-1px) scale(1.04);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    }
    .key-correct {
      background-color: #10b981 !important;
      color: #ffffff !important;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.35) !important;
    }
    .key-present {
      background-color: #f59e0b !important;
      color: #ffffff !important;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.35) !important;
    }
    .key-absent {
      background-color: rgba(15, 23, 42, 0.6) !important;
      color: #475569 !important;
      border-color: transparent !important;
      box-shadow: none !important;
      opacity: 0.4;
    }
    .key-normal { }
  `]
})
export class KeyboardComponent {
  @Input() disabled = false;
  @Input() letterStatuses: Record<string, 'CORRECT' | 'PRESENT' | 'ABSENT' | null> = {};
  @Output() keyClick = new EventEmitter<string>();

  readonly keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ];

  getKeyClass(key: string): string {
    const status = this.letterStatuses[key.toUpperCase()];
    if (status === 'CORRECT') return 'key-correct';
    if (status === 'PRESENT') return 'key-present';
    if (status === 'ABSENT') return 'key-absent';
    return 'key-normal';
  }
}
