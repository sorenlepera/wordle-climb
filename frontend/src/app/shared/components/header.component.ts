import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AppStatus } from '../../core/models/game.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="main-header">
      <div class="header-left">
        <div class="logo">
          <span class="logo-text">WORDLE</span>
          <span class="logo-accent">CLIMB</span>
        </div>
        @if (aiStatus; as status) {
          <div class="ai-badge" [class.ai-active]="status.aiConnected">
            <span class="pulse-dot"></span>
            <span class="ai-text">
              {{ status.aiConnected ? 'IA Active' : 'IA Hors-ligne' }}
            </span>
          </div>
        } @else {
          <div class="ai-badge shimmer-block" style="border-color: transparent;">
            <span class="pulse-dot" style="background-color: rgba(255,255,255,0.1)"></span>
            <span class="ai-text" style="width: 110px; height: 12px; background: rgba(255,255,255,0.1); border-radius: 4px;"></span>
          </div>
        }
      </div>
      <div class="header-right">
        @if (authService.isAuthenticated()) {
          <div class="user-badge">
            <span class="user-icon">👤</span>
            <span class="username">{{ authService.currentUser() }}</span>
            <button class="btn-text-logout" (click)="authService.logout()">Déconnexion</button>
          </div>
        } @else {
          <a routerLink="/login" class="btn-secondary" style="margin-right: 15px; text-decoration: none; display: inline-block;">Se Connecter</a>
        }
        @if (showExitButton) {
          <button class="btn-secondary" (click)="exitClicked.emit()">
            Quitter la partie
          </button>
        }
      </div>
    </header>
  `,
  styles: [`
    .main-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.1rem 2rem;
      background: rgba(8, 8, 16, 0.45);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3), inset 0 -1px 0 rgba(255, 255, 255, 0.02);
      position: relative;
      z-index: 20;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .user-badge {
      display: flex; align-items: center; gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05); padding: 0.4rem 1rem; border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .user-icon { font-size: 0.9rem; }
    .username { font-family: 'Outfit', sans-serif; font-weight: 700; color: #e2e8f0; font-size: 0.9rem; margin-right: 0.5rem; }
    .btn-text-logout {
      background: none; border: none; color: #ef4444; font-size: 0.75rem; font-weight: 700;
      cursor: pointer; padding: 0; text-transform: uppercase; text-decoration: underline; opacity: 0.8;
      transition: opacity 0.2s;
    }
    .btn-text-logout:hover { opacity: 1; }
    .logo {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.65rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .logo-text {
      background: linear-gradient(135deg, #ffffff, #e2e8f0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .logo-accent {
      background: linear-gradient(135deg, #00f2fe, #4facfe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 25px rgba(0, 242, 254, 0.25);
    }
    .ai-badge {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 0.4rem 0.85rem;
      border-radius: 30px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      user-select: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .ai-badge.ai-active {
      color: #10b981;
      background: rgba(16, 185, 129, 0.05);
      border-color: rgba(16, 185, 129, 0.25);
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.1);
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      background-color: #475569;
      border-radius: 50%;
      transition: all 0.3s ease;
    }
    .ai-badge.ai-active .pulse-dot {
      background-color: #10b981;
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      animation: pulse-badge 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
    }
    @keyframes pulse-badge {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
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
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.03);
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.07);
      padding: 0.65rem 1.35rem;
      font-size: 0.82rem;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    }
    .shimmer-block {
      background: rgba(30, 41, 59, 0.4);
      overflow: hidden;
      position: relative;
    }
    .shimmer-block::before {
      content: "";
      position: absolute;
      top: 0; left: -150%; width: 150%; height: 100%;
      background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.05) 50%, transparent 100%);
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { left: -150%; }
      100% { left: 150%; }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  
  @Input() aiStatus: AppStatus | null = null;
  @Input() showExitButton: boolean = false;
  @Output() exitClicked = new EventEmitter<void>();
}
