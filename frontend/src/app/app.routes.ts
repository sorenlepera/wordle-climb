import { Routes } from '@angular/router';
import { LobbyComponent } from './features/lobby.component';
import { GameSessionComponent } from './features/game-session.component';
import { LoginComponent } from './features/auth/login.component';
import { gameGuard } from './core/guards/game.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'lobby', pathMatch: 'full' },
  { path: 'lobby', component: LobbyComponent },
  { path: 'play', component: GameSessionComponent, canActivate: [gameGuard] },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'lobby' }
];
