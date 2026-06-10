export interface LetterClue {
  letter: string;
  status: 'CORRECT' | 'PRESENT' | 'ABSENT';
}

export interface GameState {
  sessionId: number;
  username: string;
  currentLevel: number;
  guessCount: number;
  guesses: string[];
  letterClues: LetterClue[][];
  status: 'IN_PROGRESS' | 'WON' | 'LOST';
  highScore: number;
  currentStreak: number;
  targetWord?: string;
  score: number;
  maxScore: number;
}

export interface GuessResponse {
  validWord: boolean;
  errorMessage: string | null;
  gameState: GameState;
  result: LetterClue[];
}

export interface LeaderboardEntry {
  username: string;
  highScore: number;
  maxScore: number;
}

export interface AppStatus {
  aiConnected: boolean;
  model: string;
  cacheSize: number;
}

export interface PlayerStats {
  runsStarted: number;
  deaths: number;
  sumOfLevels: number;
  maxLevel: number;
  levelDistribution: Record<number, number>;
}
