export type PlayerType = 'player1' | 'player2' | 'ai';

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
  type: 'graycat' | 'tiger' | 'ai';
} 