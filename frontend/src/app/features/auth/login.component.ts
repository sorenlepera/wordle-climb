import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container fade-in">
      <div class="auth-card">
        <h2>{{ isRegistering ? 'CRÉER UN COMPTE' : 'CONNEXION' }}</h2>
        <p class="auth-subtitle">
          {{ isRegistering ? 'Rejoignez WORDLE CLIMB pour sauvegarder vos records.' : 'Connectez-vous pour retrouver votre progression.' }}
        </p>

        @if (errorMessage) {
          <div class="error-box">{{ errorMessage }}</div>
        }

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <div class="input-group">
            <label for="username">Pseudo</label>
            <input id="username" type="text" [(ngModel)]="username" name="username" required autocomplete="username" placeholder="Entrez votre pseudo" />
          </div>
          <div class="input-group">
            <label for="password">Mot de passe</label>
            <input id="password" type="password" [(ngModel)]="password" name="password" required autocomplete="current-password" placeholder="Entrez votre mot de passe" />
          </div>
          
          <button type="submit" class="btn-primary" [disabled]="isLoading">
            {{ isLoading ? 'CHARGEMENT...' : (isRegistering ? "S'INSCRIRE" : 'SE CONNECTER') }}
          </button>
        </form>

        <div class="auth-switch">
          <span>{{ isRegistering ? 'Déjà un compte ?' : 'Pas encore de compte ?' }}</span>
          <button type="button" class="btn-text" (click)="toggleMode()">
            {{ isRegistering ? 'Se connecter' : 'Créer un compte' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;
    }
    .auth-card {
      background: rgba(10, 10, 16, 0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 24px;
      padding: 3rem 2.5rem; width: 100%; max-width: 400px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.02);
      display: flex; flex-direction: column; gap: 1.5rem;
    }
    h2 { font-family: 'Space Grotesk', sans-serif; font-size: 1.8rem; font-weight: 800; margin: 0; text-align: center; color: #f8fafc; }
    .auth-subtitle { color: #94a3b8; font-size: 0.95rem; text-align: center; margin: 0 0 0.5rem 0; line-height: 1.5; }
    .error-box { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.8rem; border-radius: 8px; font-size: 0.9rem; text-align: center; }
    .auth-form { display: flex; flex-direction: column; gap: 1.25rem; }
    .input-group { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-size: 0.85rem; font-weight: 700; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.05em; }
    input { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 0.85rem 1rem; color: #ffffff; font-family: 'Outfit', sans-serif; font-size: 1rem; outline: none; transition: all 0.2s; }
    input:focus { border-color: #00f2fe; box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.2); }
    .btn-primary { background: linear-gradient(135deg, #00f2fe, #4facfe); color: #030712; border: none; border-radius: 10px; padding: 1rem; font-family: 'Space Grotesk', sans-serif; font-weight: 800; font-size: 1rem; cursor: pointer; transition: all 0.25s; text-transform: uppercase; margin-top: 0.5rem; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0, 242, 254, 0.3); }
    .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
    .auth-switch { display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 1rem; font-size: 0.9rem; color: #94a3b8; }
    .btn-text { background: none; border: none; color: #00f2fe; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; padding: 0; text-decoration: underline; text-underline-offset: 4px; transition: color 0.2s; }
    .btn-text:hover { color: #ffffff; }
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  isRegistering = false;
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  toggleMode() {
    this.isRegistering = !this.isRegistering;
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.username.trim() || !this.password.trim()) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const obs = this.isRegistering 
      ? this.authService.register(this.username, this.password)
      : this.authService.login(this.username, this.password);

    obs.subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']); // Redirect to lobby
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || "Erreur d'authentification.";
      }
    });
  }
}
