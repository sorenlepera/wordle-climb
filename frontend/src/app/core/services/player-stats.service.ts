import { Injectable, signal } from '@angular/core';
import { PlayerStats } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class PlayerStatsService {
  playerStats = signal<PlayerStats>({
    runsStarted: 0,
    deaths: 0,
    sumOfLevels: 0,
    maxLevel: 0,
    levelDistribution: {}
  });

  constructor() {
    this.loadStats();
  }

  private loadStats() {
    const stats = localStorage.getItem('wordle_climb_stats_v2');
    if (stats) {
      try {
        this.playerStats.set(JSON.parse(stats));
      } catch (e) {
        console.error('Failed to parse stats', e);
      }
    }
  }

  private saveStats(stats: PlayerStats) {
    this.playerStats.set(stats);
    localStorage.setItem('wordle_climb_stats_v2', JSON.stringify(stats));
  }

  recordRunStart() {
    const stats = { ...this.playerStats() };
    stats.runsStarted++;
    this.saveStats(stats);
  }

  recordDeath(levelReached: number) {
    const stats = { ...this.playerStats() };
    stats.deaths++;
    stats.sumOfLevels += levelReached;
    if (levelReached > stats.maxLevel) {
      stats.maxLevel = levelReached;
    }
    
    if (!stats.levelDistribution[levelReached]) {
      stats.levelDistribution[levelReached] = 0;
    }
    stats.levelDistribution[levelReached]++;
    
    this.saveStats(stats);
  }
}
