export type PlayerType = 'player1' | 'player2' | 'ai';
export type PlayerCharacterType = 'graycat' | 'tiger' | 'ai';

export type CellState = 
  | { state: 'empty' }
  | { state: 'normal'; player: PlayerType }
  | { state: 'drop'; player: PlayerType }
  | { state: 'star'; player: PlayerType };

export interface Connect4Result {
  hasConnect4: boolean;
  cellsToRemove: [number, number][]; // [row, col]
}

export interface ComboResult {
  hasCombo: boolean;
  cellsToRemove: [number, number][];
}

export interface PlayerInfo {
  name: string;
  avatar: string;
  score: number;
  isTurn: boolean;
  timer: number;
  isActive: boolean;
  type: PlayerCharacterType;
} 

// ゲーム結果の型定義
export interface GameResult {
  result: 'win' | 'lose' | 'draw' | 'timeup';
  winner?: string;
  timeUpPlayer?: 'player1' | 'player2';
}

// ゲーム設定の型定義
export interface GameSettings {
  winScore: 1 | 3 | 5;           // 勝利に必要なスコア
  timeLimit: 'none' | '30s' | '1m'; // 制限時間
}

// デフォルト設定
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  winScore: 3,
  timeLimit: 'none',
}; 