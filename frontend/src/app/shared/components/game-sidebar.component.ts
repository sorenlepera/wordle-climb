import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="game-stats-sidebar">
      <div class="stat-box">
        <span class="stat-label">NIVEAU</span>
        <span class="stat-value level-value">Niv {{ currentLevel || 1 }}</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">SCORE</span>
        <span class="stat-value level-value">{{ score || 0 }} pts</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">SÉRIE</span>
        <span class="stat-value streak-value">{{ currentStreak || 0 }} 🔥</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">RECORD</span>
        <span class="stat-value record-value">{{ maxScore || 0 }} pts</span>
      </div>
      
      <button class="stats-btn" (click)="showStats.emit()">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="18" y="3" width="4" height="18"></rect><rect x="10" y="8" width="4" height="13"></rect><rect x="2" y="13" width="4" height="8"></rect></svg>
      </button>
    </aside>
  `,
  styles: [`
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

    @media (max-width: 768px) {
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
  `]
})
export class GameSidebarComponent {
  @Input() currentLevel?: number;
  @Input() score?: number;
  @Input() currentStreak?: number;
  @Input() maxScore?: number;
  @Output() showStats = new EventEmitter<void>();
}
