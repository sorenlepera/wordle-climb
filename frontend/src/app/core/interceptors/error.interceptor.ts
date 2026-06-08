import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { GameStateService } from '../services/game-state.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const gameStateService = inject(GameStateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = 'Erreur inconnue';
      
      if (error.error instanceof ErrorEvent) {
        errorMsg = `Erreur: ${error.error.message}`;
      } else {
        if (error.status === 429) {
          errorMsg = 'Quota dépassé. Veuillez patienter.';
        } else if (error.status === 500) {
          errorMsg = 'Erreur interne du serveur';
        } else if (error.status === 0) {
          errorMsg = 'Serveur inaccessible (hors ligne)';
        } else {
          errorMsg = `Erreur ${error.status}: ${error.statusText}`;
        }
      }

      if (!req.url.includes('/status') && !req.url.includes('/auth')) {
        gameStateService.triggerErrorShake(errorMsg);
      }

      return throwError(() => error);
    })
  );
};
