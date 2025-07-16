import { CellState, PlayerType } from '../types/game';
import { checkForCombos, isColumnFull } from './gameLogic';

export enum AILevel {
  BEGINNER = 'potomaster',      // ぽと師匠
  INTERMEDIATE = 'suzitoreKataru', // スジトレ・カタル
  ADVANCED = 'gravityLaw',      // グラビティ・ロウ
  EXPERT = 'omega'           // Ωバースト・フォーゴッド
}

export interface AIMove {
  column: number;
  score: number;
}

export interface AICharacter {
  id: AILevel;
  name: string;
  nickname: string;
  description: string;
  avatar: string;
  level: string;
  levelDescription: string;
}

// AIキャラクター情報
export const AI_CHARACTERS: AICharacter[] = [
  {
    id: AILevel.BEGINNER,
    name: 'ぽとり和尚',
    nickname: '無念無想のドロップ僧',
    description: '列は見ぬ。流れに任せ、ただ落とす。勝っても「ご縁ですな」、負けても「これもまた道」。彼の落としたピースは、時に神仏すら予測できぬ位置に舞い降りる。趣味は写経。筋肉は意外とバキバキ。',
    avatar: '/assets/Avater/AIAvater/potomaster.png',
    level: '初級',
    levelDescription: 'ランダムな手を選択'
  },
  {
    id: AILevel.INTERMEDIATE,
    name: 'スジノ・カタル',
    nickname: '思考×筋繊維の融合体',
    description: '3手先まで読んでから落とすが、最後は「筋肉に聞いた」方を選ぶ。ボディビル大会と戦略研究会を掛け持ちするストイック系キャラ。「オレの二頭筋が震えている。次は右列だ。」',
    avatar: '/assets/Avater/AIAvater/suzitoreKataru.png',
    level: '中級',
    levelDescription: '基本的な攻防を行う'
  },
  {
    id: AILevel.ADVANCED,
    name: 'ジラフ・ロウ',
    nickname: '崩壊の法則を操る者',
    description: '「このピースが消えた後、3列が崩れる。」connect4plusの"落下システム"を逆手に取った重力読みの達人。計算も正確、筋肉も完璧。だが笑うとチャーミング。背中には「物理法則、背負ってます」と書かれたタトゥーがある。',
    avatar: '/assets/Avater/AIAvater/gravityLaw.png',
    level: '上級',
    levelDescription: '先読み2手で戦略的'
  },
  {
    id: AILevel.EXPERT,
    name: 'シェイド・フォー',
    nickname: '終焉に至る連鎖の神',
    description: '一手が盤面の未来すべてを決める。connect4plusにおける連鎖理論と破壊の極致を体現する存在。プレイヤーが操作しているはずなのに、なぜかAIのように見える。声は低く、「それはもう……消えている。」と呟く。',
    avatar: '/assets/Avater/AIAvater/omega.png',
    level: '最強',
    levelDescription: '先読み4手で高度な戦略'
  }
];

// AIの名前とアバターを取得
export const getAIAvatar = (level: AILevel): string => {
  const character = AI_CHARACTERS.find(char => char.id === level);
  return character?.avatar || '/assets/Avater/Avater/normal_rabbit.png';
};

export const getAIName = (level: AILevel): string => {
  const character = AI_CHARACTERS.find(char => char.id === level);
  return character?.name || 'AI 初級';
};

// AIキャラクター情報を取得
export const getAICharacter = (level: AILevel): AICharacter | undefined => {
  return AI_CHARACTERS.find(char => char.id === level);
};

// すべてのAIキャラクターを取得
export const getAllAICharacters = (): AICharacter[] => {
  return AI_CHARACTERS;
};

// 利用可能な列を取得
const getValidMoves = (board: CellState[][]): number[] => {
  const validMoves: number[] = [];
  for (let col = 0; col < board[0].length; col++) {
    if (!isColumnFull(board, col)) {
      validMoves.push(col);
    }
  }
  return validMoves;
};

// ボードをコピー
const copyBoard = (board: CellState[][]): CellState[][] => {
  return board.map(row => row.map(cell => ({ ...cell })));
};

// コマを配置
const makeMove = (board: CellState[][], column: number, player: PlayerType): CellState[][] => {
  const newBoard = copyBoard(board);
  for (let row = newBoard.length - 1; row >= 0; row--) {
    if (newBoard[row][column].state === 'empty') {
      newBoard[row][column] = { state: 'normal', player };
      break;
    }
  }
  return newBoard;
};

// 勝利判定（簡易版）
const checkWin = (board: CellState[][], player: PlayerType): boolean => {
  const result = checkForCombos(board, player);
  return result.hasCombo;
};

// 評価関数
const evaluateBoard = (board: CellState[][], aiPlayer: PlayerType): number => {
  const humanPlayer: PlayerType = aiPlayer === 'player1' ? 'player2' : 'player1';
  
  if (checkWin(board, aiPlayer)) return 1000;
  if (checkWin(board, humanPlayer)) return -1000;
  
  let score = 0;
  const centerCol = Math.floor(board[0].length / 2);
  
  // 盤面の基本評価
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col].state === 'normal') {
        const player = getCellPlayer(board[row][col]);
        const value = player === aiPlayer ? 1 : -1;
        
        // 中央列を重視
        if (col === centerCol) {
          score += value * 5;
        } else if (col === centerCol - 1 || col === centerCol + 1) {
          score += value * 3;
        } else if (col === centerCol - 2 || col === centerCol + 2) {
          score += value * 2;
        } else {
          score += value;
        }
        
        // 下の行を重視（重力のため）
        const rowBonus = (board.length - row) * 0.5;
        score += value * rowBonus;
      }
    }
  }
  
  // 潜在的な勝利パターンの評価
  score += evaluatePotentialWins(board, aiPlayer) * 10;
  
  return score;
};

// 潜在的な勝利パターンを評価
const evaluatePotentialWins = (board: CellState[][], aiPlayer: PlayerType): number => {
  const humanPlayer: PlayerType = aiPlayer === 'player1' ? 'player2' : 'player1';
  let aiPotential = 0;
  let humanPotential = 0;
  
  // 水平方向の潜在パターン
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col <= board[row].length - 4; col++) {
      const pattern = [
        getCellPlayer(board[row][col]),
        getCellPlayer(board[row][col + 1]),
        getCellPlayer(board[row][col + 2]),
        getCellPlayer(board[row][col + 3])
      ];
      
      const aiCount = pattern.filter(p => p === aiPlayer).length;
      const humanCount = pattern.filter(p => p === humanPlayer).length;
      const emptyCount = pattern.filter(p => p === 'empty').length;
      
      if (aiCount === 3 && emptyCount === 1) aiPotential += 5;
      if (aiCount === 2 && emptyCount === 2) aiPotential += 2;
      if (humanCount === 3 && emptyCount === 1) humanPotential += 5;
      if (humanCount === 2 && emptyCount === 2) humanPotential += 2;
    }
  }
  
  // 垂直方向の潜在パターン
  for (let row = 0; row <= board.length - 4; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const pattern = [
        getCellPlayer(board[row][col]),
        getCellPlayer(board[row + 1][col]),
        getCellPlayer(board[row + 2][col]),
        getCellPlayer(board[row + 3][col])
      ];
      
      const aiCount = pattern.filter(p => p === aiPlayer).length;
      const humanCount = pattern.filter(p => p === humanPlayer).length;
      const emptyCount = pattern.filter(p => p === 'empty').length;
      
      if (aiCount === 3 && emptyCount === 1) aiPotential += 5;
      if (aiCount === 2 && emptyCount === 2) aiPotential += 2;
      if (humanCount === 3 && emptyCount === 1) humanPotential += 5;
      if (humanCount === 2 && emptyCount === 2) humanPotential += 2;
    }
  }
  
  return aiPotential - humanPotential;
};

// ミニマックスアルゴリズム（アルファベータ枝刈り付き）
const minimax = (
  board: CellState[][], 
  depth: number, 
  alpha: number, 
  beta: number, 
  isMaximizing: boolean, 
  aiPlayer: PlayerType,
  maxDepth: number
): number => {
  const humanPlayer: PlayerType = aiPlayer === 'player1' ? 'player2' : 'player1';
  const currentPlayer = isMaximizing ? aiPlayer : humanPlayer;
  
  // 終端ノードの評価
  if (depth === 0 || checkWin(board, aiPlayer) || checkWin(board, humanPlayer)) {
    return evaluateBoard(board, aiPlayer);
  }
  
  const validMoves = getValidMoves(board);
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const col of validMoves) {
      const newBoard = makeMove(board, col, currentPlayer);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer, maxDepth);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // アルファベータ枝刈り
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const col of validMoves) {
      const newBoard = makeMove(board, col, currentPlayer);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer, maxDepth);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // アルファベータ枝刈り
    }
    return minEval;
  }
};

// AIの手を決定
export const aiMove = (board: CellState[][], level: AILevel): number => {
  const validMoves = getValidMoves(board);
  if (validMoves.length === 0) return -1;
  
  const aiPlayer: PlayerType = 'player2'; // AIは常にplayer2
  
  switch (level) {
    case AILevel.BEGINNER:
      // 初級: 完全ランダム
      return validMoves[Math.floor(Math.random() * validMoves.length)];
      
    case AILevel.INTERMEDIATE:
      // 中級: 基本的な攻防
      for (const col of validMoves) {
        const newBoard = makeMove(board, col, aiPlayer);
        if (checkWin(newBoard, aiPlayer)) {
          return col; // 勝てる手があれば選択
        }
      }
      
      // 相手の勝ち手を防ぐ
      for (const col of validMoves) {
        const newBoard = makeMove(board, col, 'player1');
        if (checkWin(newBoard, 'player1')) {
          return col; // 相手の勝ち手を防ぐ
        }
      }
      
      // 中央列を優先
      if (validMoves.includes(3)) return 3;
      if (validMoves.includes(2)) return 2;
      if (validMoves.includes(4)) return 4;
      
      // ランダム
      return validMoves[Math.floor(Math.random() * validMoves.length)];
      
    case AILevel.ADVANCED:
      // 上級: 先読み2手
      let bestScore = -Infinity;
      let bestMove = validMoves[0];
      
      for (const col of validMoves) {
        const newBoard = makeMove(board, col, aiPlayer);
        const score = minimax(newBoard, 2, -Infinity, Infinity, false, aiPlayer, 2);
        if (score > bestScore) {
          bestScore = score;
          bestMove = col;
        }
      }
      
      return bestMove;
      
    case AILevel.EXPERT:
      // 最強: 先読み6手以上 + 高度な評価関数
      let bestScoreExpert = -Infinity;
      let bestMoveExpert = validMoves[0];
      
      for (const col of validMoves) {
        const newBoard = makeMove(board, col, aiPlayer);
        const score = minimax(newBoard, 6, -Infinity, Infinity, false, aiPlayer, 6);
        if (score > bestScoreExpert) {
          bestScoreExpert = score;
          bestMoveExpert = col;
        }
      }
      
      return bestMoveExpert;
      
    default:
      return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
};

// AIの思考時間を取得（演出用）
export const getAIThinkingTime = (level: AILevel): number => {
  switch (level) {
    case AILevel.BEGINNER:
      return 800 + Math.random() * 1200; // 0.8-2.0秒
    case AILevel.INTERMEDIATE:
      return 1200 + Math.random() * 1800; // 1.2-3.0秒
    case AILevel.ADVANCED:
      return 3000 + Math.random() * 4000; // 3.0-7.0秒
    case AILevel.EXPERT:
      return 2000 + Math.random() * 3000; // 2.0-5.0秒（短縮）
    default:
      return 1000;
  }
}; 

// セルのプレイヤーを取得（安全な型ガード付き）
const getCellPlayer = (cell: CellState): PlayerType | 'empty' => {
  if (cell.state === 'empty') return 'empty';
  return cell.player;
};

// 水平方向の4つ並びをチェック
const checkHorizontal = (board: CellState[][], player: PlayerType): boolean => {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col <= board[0].length - 4; col++) {
      const cellPlayer = getCellPlayer(board[row][col]);
      if (cellPlayer === 'empty') continue;
      
      if (
        getCellPlayer(board[row][col]) === player &&
        getCellPlayer(board[row][col + 1]) === player &&
        getCellPlayer(board[row][col + 2]) === player &&
        getCellPlayer(board[row][col + 3]) === player
      ) {
        return true;
      }
    }
  }
  return false;
};

// 垂直方向の4つ並びをチェック
const checkVertical = (board: CellState[][], player: PlayerType): boolean => {
  for (let row = 0; row <= board.length - 4; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cellPlayer = getCellPlayer(board[row][col]);
      if (cellPlayer === 'empty') continue;
      
      if (
        getCellPlayer(board[row][col]) === player &&
        getCellPlayer(board[row + 1][col]) === player &&
        getCellPlayer(board[row + 2][col]) === player &&
        getCellPlayer(board[row + 3][col]) === player
      ) {
        return true;
      }
    }
  }
  return false;
}; 