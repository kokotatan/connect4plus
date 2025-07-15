import { CellState, PlayerType, Connect4Result, ComboResult } from '../types/game';

// ボードサイズ
export const BOARD_WIDTH = 7;
export const BOARD_HEIGHT = 8;
export const WIN_SCORE = 3;

// 空のボードを作成
export const createEmptyBoard = (): CellState[][] => {
  return Array(BOARD_HEIGHT).fill(null).map(() => 
    Array(BOARD_WIDTH).fill(null).map(() => ({ state: 'empty' }))
  );
};

// 列が満杯かチェック
export const isColumnFull = (board: CellState[][], column: number): boolean => {
  return board[0][column].state !== 'empty';
};

// 指定された方向で連続するセルをカウント（両方向）
const countConsecutiveBothDirections = (
  board: CellState[][],
  startRow: number,
  startCol: number,
  deltaRow: number,
  deltaCol: number,
  player: PlayerType
): [number, number][] => {
  const cells: [number, number][] = [];
  
  // 負方向にカウント
  for (let i = 1; i <= 3; i++) {
    const row = startRow - i * deltaRow;
    const col = startCol - i * deltaCol;
    
    if (row < 0 || row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH) {
      break;
    }
    
    const cell = board[row][col];
    if (cell.state === 'normal' && cell.player === player) {
      cells.unshift([row, col]); // 先頭に追加
    } else {
      break;
    }
  }
  
  // 現在位置を追加
  cells.push([startRow, startCol]);
  
  // 正方向にカウント
  for (let i = 1; i <= 3; i++) {
    const row = startRow + i * deltaRow;
    const col = startCol + i * deltaCol;
    
    if (row < 0 || row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH) {
      break;
    }
    
    const cell = board[row][col];
    if (cell.state === 'normal' && cell.player === player) {
      cells.push([row, col]);
    } else {
      break;
    }
  }
  
  return cells;
};

// 4つ連続チェック（縦、横、斜め）
export const checkForConnect4 = (
  board: CellState[][], 
  col: number, 
  row: number, 
  player: PlayerType
): Connect4Result => {
  const directions = [
    [0, 1],   // 横
    [1, 0],   // 縦
    [1, 1],   // 右下斜め
    [1, -1]   // 左下斜め
  ];

  for (const [deltaRow, deltaCol] of directions) {
    // 各方向で連続するセルをチェック（両方向）
    const consecutiveCells = countConsecutiveBothDirections(board, row, col, deltaRow, deltaCol, player);
    
    if (consecutiveCells.length >= 4) {
      return {
        hasConnect4: true,
        cellsToRemove: consecutiveCells.slice(0, 4)
      };
    }
  }

  return { hasConnect4: false, cellsToRemove: [] };
};

// 重力を適用（セルを下に落とす）
export const applyGravity = (board: CellState[][]): CellState[][] => {
  const newBoard = board.map(row => [...row]);
  
  for (let col = 0; col < BOARD_WIDTH; col++) {
    let writeRow = BOARD_HEIGHT - 1;
    
    // 下から上に向かって、空でないセルを下に詰める
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row][col].state !== 'empty') {
        if (writeRow !== row) {
          newBoard[writeRow][col] = newBoard[row][col];
          newBoard[row][col] = { state: 'empty' };
        }
        writeRow--;
      }
    }
  }
  
  return newBoard;
};

// コンボチェック（重力適用後の新しい4つ連続をチェック）
export const checkForCombos = (board: CellState[][], player: PlayerType): ComboResult => {
  const cellsToRemove: [number, number][] = [];
  
  // 全セルをチェック
  for (let row = 0; row < BOARD_HEIGHT; row++) {
    for (let col = 0; col < BOARD_WIDTH; col++) {
      const cell = board[row][col];
      if (cell.state === 'normal' && cell.player === player) {
        const result = checkForConnect4(board, col, row, player);
        if (result.hasConnect4) {
          cellsToRemove.push(...result.cellsToRemove);
        }
      }
    }
  }
  
  return {
    hasCombo: cellsToRemove.length > 0,
    cellsToRemove: cellsToRemove
  };
};

// 勝利条件チェック
export const checkWinCondition = (score: number, winScore: number = 3): boolean => {
  return score >= winScore;
};

// 引き分けチェック
export const isGameDraw = (board: CellState[][]): boolean => {
  // 全ての列が満杯かチェック
  for (let col = 0; col < BOARD_WIDTH; col++) {
    if (!isColumnFull(board, col)) {
      return false;
    }
  }
  return true;
}; 