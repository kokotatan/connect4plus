import React, { useState, useEffect, useCallback } from 'react';

interface PlayerInfo {
  name: string;
  avatar: string;
  score: number;
  isTurn: boolean;
  timer: number;
  isActive: boolean;
  type: 'graycat' | 'tiger';
}

interface CellState {
  state: 'empty' | 'drop' | 'normal' | 'star';
  player?: 'player1' | 'player2';
}

interface GamePlayScreenProps {
  player1: PlayerInfo;
  player2: PlayerInfo;
  onGameEnd?: (winner: string | null) => void;
}

export default function GamePlayScreen({ 
  player1: initialPlayer1,
  player2: initialPlayer2,
  onGameEnd
}: GamePlayScreenProps) {
  const [player1, setPlayer1] = useState<PlayerInfo>(initialPlayer1);
  const [player2, setPlayer2] = useState<PlayerInfo>(initialPlayer2);
  const [gameBoard, setGameBoard] = useState<CellState[][]>(
    Array(8).fill(null).map(() => Array(7).fill({ state: 'empty' }))
  );
  const [highlightedColumn, setHighlightedColumn] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // タイマーの更新
  useEffect(() => {
    const timer = setInterval(() => {
      if (player1.isTurn && player1.timer > 0) {
        setPlayer1(prev => ({ ...prev, timer: prev.timer - 1 }));
      } else if (player2.isTurn && player2.timer > 0) {
        setPlayer2(prev => ({ ...prev, timer: prev.timer - 1 }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [player1.isTurn, player1.timer, player2.isTurn, player2.timer]);

  // ゲームボードの列をクリックした時の処理
  const handleColumnClick = useCallback((columnIndex: number) => {
    if (isProcessing) return;
    
    const currentPlayer = player1.isTurn ? player1 : player2;
    const playerType = player1.isTurn ? 'player1' : 'player2';
    
    // 列の一番下の空いているセルを見つける
    const column = gameBoard.map(row => row[columnIndex]);
    const emptyRowIndex = column.findIndex(cell => cell.state === 'empty');
    
    if (emptyRowIndex === -1) return; // 列が満杯
    
    setIsProcessing(true);
    
    // 新しいゲームボードを作成
    const newGameBoard = gameBoard.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (colIndex === columnIndex && rowIndex === emptyRowIndex) {
          return { state: 'drop', player: playerType };
        }
        return cell;
      })
    );
    
    setGameBoard(newGameBoard);
    
    // 一定時間後にnormalに変更
    setTimeout(() => {
      setGameBoard(prev => prev.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (colIndex === columnIndex && rowIndex === emptyRowIndex) {
            return { state: 'normal', player: playerType };
          }
          return cell;
        })
      ));
      
      // Connect4チェックとスコア更新
      setTimeout(() => {
        checkConnect4AndUpdateScore(columnIndex, emptyRowIndex, playerType);
      }, 500);
      
    }, 1000);
  }, [gameBoard, player1.isTurn, isProcessing]);

  // Connect4チェックとスコア更新
  const checkConnect4AndUpdateScore = useCallback((colIndex: number, rowIndex: number, playerType: 'player1' | 'player2') => {
    // 簡易的なConnect4チェック（実際の実装ではより詳細なロジックが必要）
    const hasConnect4 = checkForConnect4(colIndex, rowIndex, playerType);
    
    if (hasConnect4) {
      // スコアを増やす
      if (playerType === 'player1') {
        setPlayer1(prev => ({ ...prev, score: prev.score + 1 }));
        if (player1.score + 1 >= 3) {
          onGameEnd?.(player1.name);
          return;
        }
      } else {
        setPlayer2(prev => ({ ...prev, score: prev.score + 1 }));
        if (player2.score + 1 >= 3) {
          onGameEnd?.(player2.name);
          return;
        }
      }
      
      // 該当セルを星色に変更
      setGameBoard(prev => prev.map((row, r) =>
        row.map((cell, c) => {
          if (c === colIndex && r === rowIndex) {
            return { state: 'star', player: playerType };
          }
          return cell;
        })
      ));
      
      // 一定時間後にemptyに変更
      setTimeout(() => {
        setGameBoard(prev => prev.map((row, r) =>
          row.map((cell, c) => {
            if (c === colIndex && r === rowIndex) {
              return { state: 'empty' };
            }
            return cell;
          })
        ));
        
        // セルを下に落とす
        setTimeout(() => {
          dropCells();
        }, 500);
      }, 2000);
    } else {
      // ターンを変更
      setPlayer1(prev => ({ ...prev, isTurn: !prev.isTurn }));
      setPlayer2(prev => ({ ...prev, isTurn: !prev.isTurn }));
      setIsProcessing(false);
    }
  }, [player1, player2, onGameEnd]);

  // Connect4チェック（簡易版）
  const checkForConnect4 = (colIndex: number, rowIndex: number, playerType: 'player1' | 'player2'): boolean => {
    // 実際の実装では、水平・垂直・斜めの4つ並びをチェック
    // ここでは簡易的にランダムで判定
    return Math.random() < 0.3; // 30%の確率でConnect4
  };

  // セルを下に落とす
  const dropCells = useCallback(() => {
    setGameBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      
      // 各列でセルを下に落とす
      for (let col = 0; col < 7; col++) {
        let writeIndex = 7; // 下から上に
        for (let row = 7; row >= 0; row--) {
          if (newBoard[row][col].state !== 'empty') {
            writeIndex--;
            if (writeIndex !== row) {
              newBoard[writeIndex][col] = newBoard[row][col];
              newBoard[row][col] = { state: 'empty' };
            }
          }
        }
      }
      
      return newBoard;
    });
    
    // 落とし終わったらConnect4チェック
    setTimeout(() => {
      // 全セルをチェック
      let hasConnect4 = false;
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 7; col++) {
          if (gameBoard[row][col].state === 'normal') {
            const playerType = gameBoard[row][col].player;
            if (playerType && checkForConnect4(col, row, playerType)) {
              hasConnect4 = true;
              break;
            }
          }
        }
      }
      
      if (!hasConnect4) {
        // ターンを変更
        setPlayer1(prev => ({ ...prev, isTurn: !prev.isTurn }));
        setPlayer2(prev => ({ ...prev, isTurn: !prev.isTurn }));
        setIsProcessing(false);
      }
    }, 1000);
  }, [gameBoard]);

  // マウスホバー時のハイライト処理
  const handleColumnHover = (columnIndex: number) => {
    if (!isProcessing && (player1.isTurn || player2.isTurn)) {
      setHighlightedColumn(columnIndex);
    }
  };

  const handleColumnLeave = () => {
    setHighlightedColumn(null);
  };

  // ゲームボードの列をレンダリング
  const renderColumn = (columnIndex: number) => {
    const column = gameBoard.map(row => row[columnIndex]);
    const isHighlighted = highlightedColumn === columnIndex;
    const isClickable = !isProcessing && (player1.isTurn || player2.isTurn);

    return (
      <div 
        key={columnIndex}
        className="w-10 h-96 relative cursor-pointer"
        onClick={() => isClickable && handleColumnClick(columnIndex)}
        onMouseEnter={() => handleColumnHover(columnIndex)}
        onMouseLeave={handleColumnLeave}
      >
        {/* ハイライト背景 */}
        <div className={`w-10 h-96 absolute transition-colors duration-200 ${
          isHighlighted ? 'bg-emerald-300' : 'bg-emerald-300'
        }`}></div>
        
        {/* 各セル */}
        {column.map((cell, rowIndex) => (
          <div 
            key={rowIndex}
            className="w-10 h-10 absolute rounded-full"
            style={{ top: `${rowIndex * 45}px` }}
          >
            <div className={`w-10 h-10 rounded-full ${
              cell.state === 'empty' ? 'bg-stone-50' :
              cell.state === 'drop' ? 'bg-blue-500' :
              cell.state === 'normal' ? 
                (cell.player === 'player1' ? 'bg-blue-800' : 'bg-green-700') :
              cell.state === 'star' ? 'bg-yellow-400' : 'bg-stone-50'
            }`}></div>
          </div>
        ))}
      </div>
    );
  };

  // スコアゲージのレンダリング
  const renderScoreGauge = (score: number) => {
    const filledWidth = Math.min(score, 3) * (20 / 3); // 20pxを3分割
    
    return (
      <div className="w-20 h-5 relative">
        <div className="w-20 h-5 absolute bg-green-100 rounded-[50px]"></div>
        <div className="w-5 h-5 left-[19.43px] top-0 absolute bg-green-200"></div>
        <div 
          className="h-5 absolute bg-green-200 rounded-[50px] transition-all duration-300"
          style={{ width: `${filledWidth}px` }}
        ></div>
      </div>
    );
  };

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-center bg-stone-50">
      <div className="w-96 h-[953px] relative bg-white overflow-hidden rounded-2xl shadow-xl">
        {/* タイトルバー */}
        <div className="w-96 h-[953px] left-0 top-0 absolute">
          <div className="w-96 h-[953px] left-0 top-0 absolute bg-stone-50"></div>
          <div className="w-44 h-4 left-[103px] top-[42px] absolute text-center justify-start text-gray-500 text-xs font-semibold font-['Noto_Sans'] leading-snug">
            次世代方立体四目並べ
          </div>
          <div className="w-44 h-4 left-[103px] top-[19px] absolute text-center justify-start text-black text-2xl font-semibold font-['Noto_Sans'] leading-snug">
            connect4plus
          </div>
        </div>

        {/* Player1情報 */}
        <div className={`w-44 h-20 left-[20px] top-[76px] absolute ${player1.isTurn ? 'opacity-100' : 'opacity-70'}`}>
          {/* ターンインジケーター */}
          <div className={`w-24 h-1.5 left-[70px] top-[53px] absolute ${
            player1.isTurn ? 'bg-emerald-400' : 'bg-zinc-300'
          }`}></div>
          
          {/* タイマー */}
          <div className="w-20 h-5 left-[70px] top-[33px] absolute">
            <div className="w-11 h-3.5 left-0 top-0 absolute justify-center text-gray-600 text-xl font-semibold font-['Noto_Sans'] leading-loose">
              {Math.floor(player1.timer / 60).toString().padStart(2, '0')}:{(player1.timer % 60).toString().padStart(2, '0')}
            </div>
          </div>
          
          {/* オンライン状態 */}
          <div className="w-4 h-4 left-[121px] top-[31px] absolute">
            <div className={`w-4 h-4 left-0 top-0 absolute rounded-full ${
              player1.isActive ? 'bg-emerald-400' : 'bg-slate-600'
            }`}></div>
          </div>
          
          {/* スコアゲージ */}
          <div className="w-20 h-5 left-0 top-[66px] absolute">
            {renderScoreGauge(player1.score)}
          </div>
          
          {/* アバター背景 */}
          <div className="w-16 h-16 left-[3px] top-0 absolute bg-emerald-100 rounded-full"></div>
          
          {/* アバター */}
          <img 
            className="w-16 h-16 left-[3px] top-0 absolute" 
            src={player1.avatar} 
            alt="Player 1 Avatar"
          />
          
          {/* プレイヤー名 */}
          <div className="w-28 h-7 left-[70px] top-[-2px] absolute">
            <div className="w-28 h-7 left-0 top-0 absolute justify-center text-black text-2xl font-semibold font-['Noto_Sans'] leading-[50px]">
              {player1.name}
            </div>
          </div>
        </div>

        {/* Player2情報 */}
        <div className={`w-44 h-24 left-[193px] top-[71px] absolute ${player2.isTurn ? 'opacity-100' : 'opacity-70'}`}>
          {/* スコアゲージ */}
          <div className="w-20 h-5 left-[102px] top-[71px] absolute">
            {renderScoreGauge(player2.score)}
          </div>
          
          {/* ターンインジケーター */}
          <div className={`w-24 h-1.5 left-[23px] top-[58px] absolute ${
            player2.isTurn ? 'bg-emerald-400' : 'bg-zinc-300'
          }`}></div>
          
          {/* アバター背景 */}
          <div className="w-16 h-16 left-[118px] top-0 absolute bg-emerald-100 rounded-full"></div>
          
          {/* オンライン状態 */}
          <div className="w-4 h-4 left-[46px] top-[36px] absolute">
            <div className={`w-4 h-4 left-0 top-0 absolute rounded-full ${
              player2.isActive ? 'bg-emerald-400' : 'bg-slate-600'
            }`}></div>
          </div>
          
          {/* タイマー */}
          <div className="w-20 h-6 left-[69px] top-[36px] absolute">
            <div className="w-11 h-4 left-0 top-0 absolute text-right justify-center text-gray-600 text-xl font-semibold font-['Noto_Sans'] leading-loose">
              {Math.floor(player2.timer / 60).toString().padStart(2, '0')}:{(player2.timer % 60).toString().padStart(2, '0')}
            </div>
          </div>
          
          {/* アバター */}
          <img 
            className="w-16 h-16 left-[118px] top-0 absolute" 
            src={player2.avatar} 
            alt="Player 2 Avatar"
          />
          
          {/* プレイヤー名 */}
          <div className="w-28 h-7 left-[-2px] top-[2px] absolute">
            <div className="w-28 h-7 left-0 top-0 absolute text-right justify-center text-black text-2xl font-semibold font-['Noto_Sans'] leading-[50px]">
              {player2.name}
            </div>
          </div>
        </div>

        {/* ゲームボード */}
        <div className="w-80 h-96 left-[27px] top-[184px] absolute">
          <div className="w-80 h-96 left-0 top-0 absolute bg-green-100 rounded-[20px]"></div>
          
          {/* 7列のゲームボード */}
          {Array.from({ length: 7 }, (_, i) => renderColumn(i))}
        </div>

        {/* Presented by */}
        <div className="w-64 h-3.5 left-[107px] top-[618px] absolute">
          <div className="w-64 h-3.5 left-0 top-0 absolute text-right justify-start text-gray-500 text-sm font-semibold font-['Noto_Sans'] leading-snug">
            Presented by Kotaro Design Lab.
          </div>
        </div>

        {/* 下部背景 */}
        <div className="w-96 h-72 left-0 top-[656px] absolute bg-zinc-300"></div>
      </div>
    </main>
  );
} 