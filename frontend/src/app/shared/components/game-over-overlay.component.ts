import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-over-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="run-over-container modal-slide">
      <div class="loss-emoji">💀</div>
      <h2>PARTIE TERMINÉE</h2>
      <p class="run-over-text">
        Vous n'avez pas réussi à deviner le mot du <strong>Niveau {{ currentLevel || 0 }}</strong>.
        Votre série de <strong>{{ currentStreak || 0 }}</strong> est terminée.
      </p>
      @if (targetWord) {
        <p class="revealed-word-text">
          Le mot était : <strong class="revealed-word">{{ targetWord }}</strong>
        </p>
      }
      <div class="summary-details">
        <div class="detail-row">
          <span>Score final :</span>
          <strong>{{ score || 0 }} pts</strong>
        </div>
        <div class="detail-row">
          <span>Meilleur score :</span>
          <strong>{{ maxScore || 0 }} pts</strong>
        </div>
        <div class="detail-row">
          <span>Niveau maximal atteint :</span>
          <strong>Niveau {{ highScore || 0 }}</strong>
        </div>
      </div>
      <div class="action-buttons">
        <button class="btn-primary" (click)="resetRun.emit()">
          RECOMMENCER (NIVEAU 1)
        </button>
        <button class="btn-secondary" (click)="exitGame.emit()">
          RETOUR AU SALON
        </button>
      </div>
    </div>
  `,
  styles: [`
    .run-over-container {
      background: rgba(10, 10, 16, 0.85); backdrop-filter: blur(24px);
      border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 24px;
      padding: 3rem 2.25rem; text-align: center;
      box-shadow: 0 35px 70px rgba(0, 0, 0, 0.65), 0 0 30px rgba(239, 68, 68, 0.05);
      width: 100%; display: flex; flex-direction: column; align-items: center; gap: 1.6rem;
      margin-top: auto; margin-bottom: auto;
    }
    .loss-emoji { font-size: 3.8rem; animation: heartbeat 1.5s infinite; }
    h2 {
      font-family: 'Space Grotesk', sans-serif; font-size: 2.2rem; font-weight: 800; margin: 0; letter-spacing: 0.04em;
      background: linear-gradient(135deg, #ef4444, #f87171);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .run-over-text { color: #cbd5e1; font-size: 1.05rem; line-height: 1.65; margin: 0; }
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
    .modal-slide { animation: slideUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes heartbeat { 0% { transform: scale(1); } 14% { transform: scale(1.15); } 28% { transform: scale(1); } 42% { transform: scale(1.15); } 70% { transform: scale(1); } }
  `]
})
export class GameOverOverlayComponent {
  @Input() currentLevel?: number;
  @Input() currentStreak?: number;
  @Input() targetWord?: string;
  @Input() score?: number;
  @Input() maxScore?: number;
  @Input() highScore?: number;
  
  @Output() resetRun = new EventEmitter<void>();
  @Output() exitGame = new EventEmitter<void>();
}
