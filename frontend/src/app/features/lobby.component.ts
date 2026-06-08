import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameStateService } from '../core/services/game-state.service';
import { ScorePipe } from '../shared/pipes/score.pipe';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule, ScorePipe],
  template: `
    <div class="welcome-container fade-in">
      <div class="welcome-card">
        <h1>Ascension de la Tour Wordle</h1>
        <p class="subtitle">Terminez les niveaux pour grimper plus haut. Des mots complexes vous attendent. Une seule erreur réinitialise votre ascension au niveau 1. Jusqu'où pourrez-vous monter ?</p>
        
        <div class="form-group">
          @if (!authService.isAuthenticated()) {
            <p class="auth-prompt">Vous devez être connecté pour jouer.</p>
            <button class="btn-primary" (click)="router.navigate(['/login'])">
              CRÉER UN COMPTE / SE CONNECTER
            </button>
          } @else {
            <p class="auth-prompt">Connecté en tant que <strong>{{ authService.currentUser() }}</strong></p>
            
            @if (errorMessage) {
              <div class="error-banner">
                {{ errorMessage }}
              </div>
            }
            
            <button class="btn-primary" [disabled]="isLoading" (click)="onStart()">
              @if (isLoading) {
                <span class="spinner"></span> CHARGEMENT...
              } @else {
                COMMENCER L'ASCENSION
              }
            </button>
          }
        </div>
      </div>

      <div class="leaderboard-card">
        <h2>🏆 Meilleurs Grimpeurs</h2>
        <div class="leaderboard-list">
          @if (gameStateService.leaderboard().length === 0) {
            <div class="empty-state">Aucune partie enregistrée pour le moment. Soyez le premier !</div>
          } @else {
            <table>
              <thead>
                <tr>
                  <th>Rang</th>
                  <th>Joueur</th>
                  <th>Score Max</th>
                </tr>
              </thead>
              <tbody>
                @for (entry of gameStateService.leaderboard(); track entry.username; let idx = $index) {
                  <tr [class.top-three]="idx < 3">
                    <td class="rank-col">
                      @if (idx === 0) { 🥇 }
                      @else if (idx === 1) { 🥈 }
                      @else if (idx === 2) { 🥉 }
                      @else { #{{ idx + 1 }} }
                    </td>
                    <td class="username-col">{{ entry.username }}</td>
                    <td class="level-col">{{ entry.maxScore | scoreFormat }} (Niv. {{ entry.highScore }})</td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      display: flex;
      gap: 3rem;
      width: 100%;
      max-width: 1120px;
      align-items: flex-start;
    }
    @media (max-width: 900px) {
      .welcome-container {
        flex-direction: column;
        align-items: center;
        gap: 2rem;
        overflow-y: auto;
        max-height: 100%;
        padding-bottom: 2rem;
      }
    }
    .welcome-card, .leaderboard-card {
      background: rgba(10, 10, 16, 0.65);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      padding: 2.75rem;
      flex: 1;
      width: 100%;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
    .welcome-card h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2.6rem;
      font-weight: 800;
      margin-top: 0;
      margin-bottom: 1.25rem;
      line-height: 1.15;
      background: linear-gradient(135deg, #ffffff, #cbd5e1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .welcome-card .subtitle {
      color: #94a3b8;
      font-size: 1.05rem;
      line-height: 1.65;
      margin-bottom: 2.75rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .input-username {
      background: rgba(5, 5, 10, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #ffffff;
      padding: 1.1rem 1.5rem;
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      border-radius: 10px;
      outline: none;
      font-family: 'Space Grotesk', sans-serif;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-align: center;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
    }
    .input-username:focus {
      border-color: #00f2fe;
      background: rgba(8, 8, 16, 0.9);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 242, 254, 0.18);
    }
    .auth-prompt {
      color: #cbd5e1;
      font-size: 1.1rem;
      text-align: center;
      margin-bottom: 0.5rem;
    }
    .auth-prompt strong {
      color: #00f2fe;
      font-family: 'Space Grotesk', sans-serif;
    }
    .error-banner {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      font-size: 0.95rem;
      animation: fadeIn 0.3s ease-out;
    }
    button {
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
      border: none;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #ffffff;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .btn-primary {
      background: linear-gradient(135deg, #00f2fe, #4facfe);
      color: #030712;
      padding: 0.95rem 2rem;
      font-weight: 800;
      box-shadow: 0 0 20px rgba(0, 242, 254, 0.25);
      font-size: 0.95rem;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba(0, 242, 254, 0.45), 0 0 10px rgba(79, 70, 229, 0.2);
      background: linear-gradient(135deg, #38ef7d, #11998e);
      color: #030712;
    }
    .btn-primary:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }
    .leaderboard-card h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.6rem;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 1.75rem;
      background: linear-gradient(135deg, #ffffff, #e2e8f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .leaderboard-list {
      max-height: 330px;
      overflow-y: auto;
      border-radius: 12px;
      background: rgba(0, 0, 0, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.03);
    }
    .leaderboard-list::-webkit-scrollbar { width: 6px; }
    .leaderboard-list::-webkit-scrollbar-track { background: transparent; }
    .leaderboard-list::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 3px; }
    .leaderboard-list::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.15); }
    table { width: 100%; border-collapse: collapse; }
    th {
      color: #64748b;
      font-family: 'Space Grotesk', sans-serif;
      font-weight: 700;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 1.1rem;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    td {
      padding: 1.1rem;
      font-size: 0.95rem;
      font-weight: 500;
      border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    }
    .top-three { background: rgba(99, 102, 241, 0.03); }
    .top-three td { font-weight: 700; }
    .rank-col { width: 15%; text-align: center; font-size: 1rem; font-family: 'Space Grotesk', sans-serif; }
    .username-col { width: 55%; color: #cbd5e1; }
    .level-col { 
      width: 30%; text-align: right; color: #a855f7; 
      font-family: 'Space Grotesk', sans-serif; font-weight: 700; 
      text-shadow: 0 0 10px rgba(168, 85, 247, 0.15);
    }
    .empty-state {
      text-align: center;
      color: #64748b;
      padding: 3.5rem 0;
      font-style: italic;
      font-size: 0.92rem;
    }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LobbyComponent {
  gameStateService = inject(GameStateService);
  authService = inject(AuthService);
  router = inject(Router);

  isLoading = false;
  errorMessage = '';

  async onStart() {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      await this.gameStateService.enterGame();
    } catch (err) {
      console.error('Erreur au lancement du jeu', err);
      this.errorMessage = "Une erreur est survenue lors de la connexion au serveur. Veuillez réessayer.";
    } finally {
      this.isLoading = false;
    }
  }
}
