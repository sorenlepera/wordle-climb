import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header.component';
import { GameStateService } from './core/services/game-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  template: `
    <div class="app-container">
      <div class="bg-gradient-orb orb-1"></div>
      <div class="bg-gradient-orb orb-2"></div>

      <app-header 
        [aiStatus]="gameStateService.aiStatus()" 
        [showExitButton]="!!gameStateService.gameState()" 
        (exitClicked)="gameStateService.exitGame()">
      </app-header>

      @if (gameStateService.showError()) {
        <div class="toast toast-error">{{ gameStateService.errorMessage() }}</div>
      }
      @if (gameStateService.levelUpSuccess()) {
        <div class="toast toast-success">
          <div class="success-title">🎉 Niveau Réussi !</div>
          <div class="success-subtitle">"{{ gameStateService.lastLevelWord() }}" était correct. Chargement...</div>
        </div>
      }

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      @if (gameStateService.isAiLoading()) {
        <div class="ai-loading-overlay">
          <div class="ai-loading-card">
            <div class="ai-loading-spinner-container">
              <div class="ai-loading-spinner"></div>
              <div class="ai-loading-icon">🤖</div>
            </div>
            <h3>Intelligence Artificielle</h3>
            <p>Choix du prochain mot...</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #f8fafc;
      background-color: #040408;
      background-image: radial-gradient(rgba(99, 102, 241, 0.06) 1.5px, transparent 1.5px);
      background-size: 24px 24px;
      height: 100vh;
      position: relative;
      overflow: hidden;
    }
    .app-container {
      height: 100vh; display: flex; flex-direction: column; position: relative; z-index: 10; overflow: hidden;
    }
    .bg-gradient-orb {
      position: absolute; border-radius: 50%; filter: blur(150px); opacity: 0.22; pointer-events: none; z-index: 1;
      animation: float-orb 20s infinite ease-in-out alternate;
    }
    .orb-1 {
      width: 500px; height: 500px; background: radial-gradient(circle, #7c3aed, #d946ef); top: -150px; left: -150px; animation-duration: 22s;
    }
    .orb-2 {
      width: 600px; height: 600px; background: radial-gradient(circle, #06b6d4, #3b82f6); bottom: -200px; right: -150px; animation-duration: 28s;
    }
    @keyframes float-orb {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(50px, 30px) scale(1.1); }
      100% { transform: translate(-30px, -50px) scale(0.95); }
    }
    .main-content {
      flex: 1; display: flex; flex-direction: column; align-items: center; padding: 1.5rem; z-index: 10; overflow-y: auto; max-height: calc(100vh - 74px);
    }
    .toast {
      position: fixed; top: 6.5rem; left: 50%; transform: translate(-50%, -20px); padding: 1rem 2rem; border-radius: 12px;
      font-family: 'Space Grotesk', sans-serif; font-weight: 700; z-index: 100; box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6);
      animation: toast-in-out 2s forwards; pointer-events: none; text-align: center;
    }
    .toast-error {
      background: rgba(239, 68, 68, 0.9); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    }
    .toast-success {
      background: rgba(16, 185, 129, 0.9); color: #ffffff; min-width: 290px; border: 1px solid rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
    }
    .success-title { font-size: 1.12rem; font-weight: 800; margin-bottom: 0.2rem; }
    .success-subtitle { font-size: 0.88rem; font-weight: 400; opacity: 0.9; }
    @keyframes toast-in-out {
      0% { opacity: 0; transform: translate(-50%, -20px); }
      15% { opacity: 1; transform: translate(-50%, 0); }
      85% { opacity: 1; transform: translate(-50%, 0); }
      100% { opacity: 0; transform: translate(-50%, -20px); }
    }
    .ai-loading-overlay {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 999;
      background: rgba(4, 4, 10, 0.7); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      display: flex; justify-content: center; align-items: center;
    }
    .ai-loading-card {
      background: rgba(10, 10, 16, 0.85); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 20px;
      padding: 3rem 4rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem;
      box-shadow: 0 0 40px rgba(99, 102, 241, 0.15), inset 0 0 20px rgba(255, 255, 255, 0.02);
    }
    .ai-loading-spinner-container { position: relative; width: 64px; height: 64px; }
    .ai-loading-spinner {
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      border: 3px solid rgba(99, 102, 241, 0.2); border-top-color: #00f2fe; border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    .ai-loading-icon {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.8rem;
    }
    .ai-loading-card h3 {
      margin: 0; font-family: 'Space Grotesk', sans-serif; font-size: 1.4rem;
      background: linear-gradient(135deg, #00f2fe, #4facfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .ai-loading-card p { margin: 0; color: #94a3b8; font-size: 0.95rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class App implements OnInit {
  gameStateService = inject(GameStateService);

  ngOnInit() {
    this.gameStateService.loadLeaderboard();
    this.gameStateService.checkAiStatus();
  }
}
