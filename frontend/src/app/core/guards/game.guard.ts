import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GameStateService } from '../services/game-state.service';

export const gameGuard: CanActivateFn = (route, state) => {
  const gameStateService = inject(GameStateService);
  const router = inject(Router);

  // If there is no active game state, redirect to lobby
  if (!gameStateService.gameState()) {
    return router.parseUrl('/lobby');
  }

  return true;
};
