import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppStatus, GameState, GuessResponse, LeaderboardEntry } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/game';

  getStatus(): Observable<AppStatus> {
    return this.http.get<AppStatus>(`${this.apiUrl}/status`);
  }

  startGame(): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/start`, {});
  }

  submitGuess(word: string): Observable<GuessResponse> {
    return this.http.post<GuessResponse>(`${this.apiUrl}/guess`, { word });
  }

  nextLevel(): Observable<GameState> {
    return this.http.post<GameState>(`${this.apiUrl}/next-level`, {});
  }

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${this.apiUrl}/leaderboard`);
  }
}
