import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content modal-slide" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="close.emit()">×</button>
        
        <h2>STATISTIQUES</h2>
        
        <div class="stats-overview">
          <div class="stat-item">
            <div class="stat-val">{{ totalGames }}</div>
            <div class="stat-lbl">Joués</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ winPercentage }}%</div>
            <div class="stat-lbl">Victoires</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ currentStreak }}</div>
            <div class="stat-lbl">Série Actuelle</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">{{ maxStreak }}</div>
            <div class="stat-lbl">Série Max</div>
          </div>
        </div>

        <h3>RÉPARTITION DES ESSAIS</h3>
        
        <div class="chart-container">
          @for (count of distribution; track $index) {
            <div class="chart-row">
              <div class="row-num">{{ $index + 1 }}</div>
              <div class="row-bar-container">
                <div class="row-bar" 
                     [style.width.%]="getBarWidth(count)" 
                     [class.highlight]="count > 0 && count === maxCount">
                  {{ count }}
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      display: flex; justify-content: center; align-items: center;
      z-index: 10000;
    }
    .modal-content {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      width: 90%;
      max-width: 400px;
      position: relative;
      color: #f8fafc;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }
    .close-btn {
      position: absolute;
      top: 10px; right: 15px;
      background: none; border: none;
      color: #94a3b8; font-size: 1.8rem;
      cursor: pointer;
    }
    .close-btn:hover { color: #fff; }
    h2, h3 {
      font-family: 'Space Grotesk', sans-serif;
      text-align: center;
      margin-top: 0;
      letter-spacing: 0.05em;
    }
    h2 { margin-bottom: 1.5rem; font-size: 1.5rem; }
    h3 { margin-bottom: 1rem; font-size: 1.1rem; color: #cbd5e1; margin-top: 2rem; }
    
    .stats-overview {
      display: flex; justify-content: space-between;
      margin-bottom: 2rem;
    }
    .stat-item {
      display: flex; flex-direction: column; align-items: center;
      flex: 1;
    }
    .stat-val {
      font-size: 1.8rem; font-family: 'Space Grotesk', sans-serif; font-weight: 700;
    }
    .stat-lbl {
      font-size: 0.65rem; color: #94a3b8; text-transform: uppercase;
      text-align: center; margin-top: 5px;
    }

    .chart-container {
      display: flex; flex-direction: column; gap: 6px;
    }
    .chart-row {
      display: flex; align-items: center; gap: 8px;
    }
    .row-num {
      width: 15px; text-align: right; font-weight: bold; color: #cbd5e1;
    }
    .row-bar-container {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      height: 24px;
      display: flex;
    }
    .row-bar {
      background: #475569;
      height: 100%;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 8px;
      font-size: 0.8rem;
      font-weight: bold;
      min-width: 20px; /* enough to show '0' */
      transition: width 0.5s ease-out;
    }
    .row-bar.highlight {
      background: #10b981;
    }
    .modal-slide { animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StatsModalComponent {
  @Input() distribution: number[] = [0, 0, 0, 0, 0, 0];
  @Input() currentStreak = 0;
  @Input() maxStreak = 0;
  
  @Output() close = new EventEmitter<void>();

  get totalGames() {
    return this.distribution.reduce((acc, curr) => acc + curr, 0); // Simplified: assumes every win is a game. Real Wordle tracks losses too.
  }

  get winPercentage() {
    // If we only track wins, it's 100%. To make it realistic, we should track losses.
    // For now, let's just show 100% or 0% if no games played.
    return this.totalGames > 0 ? 100 : 0;
  }

  get maxCount() {
    return Math.max(...this.distribution, 1); // Avoid div by 0
  }

  getBarWidth(count: number): number {
    return Math.max(7, (count / this.maxCount) * 100); // Min 7% width to show the number
  }
}
