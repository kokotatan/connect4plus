import React, { useState, useEffect, useRef } fromreact';
import [object Object]useRouter } from 'next/router';
import [object Object]BGMControlButton } from ../components/BGMControlButton;
import { useBGM } from '../contexts/BGMContext';
import { useTheme } from ../contexts/ThemeContext;
import GameGrid from '../components/GameGrid';
import ScoreGauge from '../components/ScoreGauge';
import RulesPopup from '../components/RulesPopup';
import { CellState, PlayerInfo, GameSettings, DEFAULT_GAME_SETTINGS, PlayerType } from../types/game;
import [object Object] createEmptyBoard, checkForCombos, applyGravity, checkWinCondition, isColumnFull } from '../utils/gameLogic;

export default function OfflineGamePlayPage() [object Object]const router = useRouter();
  const[object Object] switchToHomeBGM } = useBGM();
  const { colors } = useTheme();

  // URLパラメータ取得
  const { player1Name, player2Name, winScore, timeLimit } = router.query;

  // ゲーム設定
  const gameSettings: GameSettings = {
    winScore: winScore ? parseInt(winScore as string) as 1 |3| 5 : DEFAULT_GAME_SETTINGS.winScore,
    timeLimit: (timeLimit as none' | '30s' | 1m) || DEFAULT_GAME_SETTINGS.timeLimit,
  };

  // プレイヤー情報
  const [player1, setPlayer1] = useState<PlayerInfo>({
    name: (player1Name as string) || 'プレイヤー1  avatar: /assets/Avater/Avater/normal_graycat.png',
    score: 0,
    isTurn: true,
    timer: 0,
    isActive: true,
    type: graycat,
  });
  const [player2, setPlayer2] = useState<PlayerInfo>({
    name: (player2Name as string) || 'プレイヤー2  avatar: /assets/Avater/Avater/normal_tiger.png',
    score: 0,
    isTurn: false,
    timer: 0,
    isActive: true,
    type:tiger,
  });

  // ゲーム状態
  const [gameBoard, setGameBoard] = useState<CellState[][]>(createEmptyBoard());
  const highlightedColumn, setHighlightedColumn] = useState<number | null>(null);
  const [lastMoveColumn, setLastMoveColumn] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const timers, setTimers] = useState({ player1: 0, player2: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const result, setResult] = useState<{ result: 'win| 'draw; winner?: string } | null>(null);
  const [finalBoard, setFinalBoard] = useState<CellState[][] | null>(null);

  // Connect4/COMBO演出
  const [connect4Visible, setConnect4Visible] = useState(false);
  const [connect4Player, setConnect4Player] = useState<'player1' | player2 | null>(null);
  const [connect4Message, setConnect4Message] = useState(');
  const [comboVisible, setComboVisible] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [fireworkVisible, setFireworkVisible] = useState(false);
  const effectIdRef = useRef(0onst [scoreEffects, setScoreEffects] = useState<Array<[object Object]   id: number;
    isVisible: boolean;
    score: number;
    playerType: 'player1 | er2;
    position: { x: number; y: number };
  }>>([]);

  // 先手抽選
  const [gameStarting, setGameStarting] = useState(false);
  const [lotteryPhase, setLotteryPhase] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<'player1' | player2 | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showFirstTurnOverlay, setShowFirstTurnOverlay] = useState(false);
  const [firstTurnPlayerName, setFirstTurnPlayerName] = useState(  // ルール説明
  const [showRules, setShowRules] = useState(false);

  // 先手抽選
  useEffect(() =>[object Object]   if (player1Name && player2e) {
      setGameStarting(true);
      setTimeout(() => {
        setLotteryPhase(true);
        const randomValue = Math.random();
        const firstTurn = randomValue <00.5player1' : player2';
        setSelectedPlayer(firstTurn);
        setTimeout(() => {
          setGameStarted(true);
          setPlayer1(prev => ({ ...prev, isTurn: firstTurn === 'player1' }));
          setPlayer2(prev => ({ ...prev, isTurn: firstTurn === 'player2' }));
          setFirstTurnPlayerName(firstTurn === player1 ? player1.name : player2me);
          setShowFirstTurnOverlay(true);
          setTimeout(() => setShowFirstTurnOverlay(false), 1700);
        }, 250;
      },150    } else {
      router.push(/offline-game');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player1, player2Name]);

  // タイマー
  useEffect(() => {
    if (gameStarted && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimers(prev => ([object Object]
          player1: player1.isTurn ? prev.player1 + 1player1,
          player2: player2.isTurn ? prev.player2 + 1v.player2,
        }));
      }, 1000);
    }
    return () =>[object Object]      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver, player1.isTurn, player2isTurn]);

  // 時間表示
  const formatTime = (seconds: number) => [object Object] const mins = Math.floor(seconds / 60;
    const secs = seconds % 60    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(20)}`;
  };

  // 列クリック
  const handleColumnClick = async (columnIndex: number) => {
    if (isProcessing || gameOver || !gameStarted) return;
    const playerType: PlayerType = player1.isTurn ? 'player1 :player2';
    if (isColumnFull(gameBoard, columnIndex)) return;
    
    // 一番下の空セルを探す
    let targetRow = -1;
    for (let row = gameBoard.length - 1; row >=0 row--) {
      if (gameBoard[row][columnIndex].state === empty) {
        targetRow = row;
        break;
      }
    }
    if (targetRow ===-1) return;
    
    setIsProcessing(true);
    setHighlightedColumn(null);
    setLastMoveColumn(columnIndex);
    
    try[object Object]    // セルを置く
      let newBoard: CellState[] = gameBoard.map((row, rIdx) =>
        row.map((cell, cIdx) => (rIdx === targetRow && cIdx === columnIndex ? { state:normal', player: playerType } : cell))
      );
      setGameBoard(newBoard);
      
      // 盤面が安定するまで両プレイヤーで連鎖判定
      let comboing = true;
      let localScore1 = 0    let localScore2 = 0    let comboChainCount =0    let tempPlayer1Score = player1re;
      let tempPlayer2Score = player2e;
      let comboWin = false;
      
      while (comboing) [object Object]        comboing = false;
        comboChainCount++;
        
        //1 どちらのプレイヤーも4るか判定
        const combos = 
         [object Object]type: 'player1' as PlayerType, result: checkForCombos(newBoard, 'player1,
         [object Object]type: 'player2' as PlayerType, result: checkForCombos(newBoard, 'player2      ];
        
        // 2. 星セル化・スコア加算
        let foundCombo = false;
        combos.forEach(({ type, result }) => {
          if (result.hasCombo) {
            foundCombo = true;
            // Connect4成立時の視覚的フィードバック
            const playerName = type === player1 ? player1.name : player2.name;
            setConnect4Player(type);
            setConnect4sage(`${playerName}がConnect4しました！`);
            setConnect4Visible(true);
            setTimeout(() => {
              setConnect4Visible(false);
              setConnect4Player(null);
              setConnect4Message(');
            }, 200      
            newBoard = newBoard.map((row, rIdx) =>
              row.map((cell, cIdx) =>
                result.cellsToRemove.some(([rowIdx, colIdx]) => rowIdx === rIdx && colIdx === cIdx)
                  ?[object Object] ...cell, state: 'star, player: type }
                  : cell
              )
            );
            setGameBoard(newBoard);
            
            if (type === 'player1) {             localScore1              tempPlayer1Score++;
            }
            if (type === 'player2) {             localScore2              tempPlayer2Score++;
            }
          }
        });
        
        // COMBO!演出を表示
        if (comboChainCount > 1 && foundCombo) [object Object]          setComboCount(comboChainCount);
          setComboVisible(true);
          setTimeout(() => setComboVisible(false),2000       }
        
        // ここで勝利判定
        if (checkWinCondition(tempPlayer1Score, gameSettings.winScore)) {
          setPlayer1(prev => ({ ...prev, score: tempPlayer1Score }));
          setPlayer2(prev => ({ ...prev, score: tempPlayer2Score }));
          setGameOver(true);
          setResult({ result: 'win, winner: player1.name });
          setFinalBoard(newBoard);
          setFireworkVisible(true);
          setTimeout(() => setFireworkVisible(false), 3000);
          comboWin = true;
          break;
        }
        if (checkWinCondition(tempPlayer2Score, gameSettings.winScore)) {
          setPlayer1(prev => ({ ...prev, score: tempPlayer1Score }));
          setPlayer2(prev => ({ ...prev, score: tempPlayer2Score }));
          setGameOver(true);
          setResult({ result: 'win, winner: player2.name });
          setFinalBoard(newBoard);
          setFireworkVisible(true);
          setTimeout(() => setFireworkVisible(false), 3000);
          comboWin = true;
          break;
        }
        
        if (!foundCombo) break;
        
        // 3. 星セルを一定時間後に消去
        await new Promise(res => setTimeout(res, 120));
        combos.forEach(({ result }) => {
          if (result.hasCombo)[object Object]          newBoard = newBoard.map((row, rIdx) =>
              row.map((cell, cIdx) =>
                result.cellsToRemove.some(([rowIdx, colIdx]) => rowIdx === rIdx && colIdx === cIdx)
                  ? { state: 'empty' }
                  : cell
              )
            );
          }
        });
        setGameBoard(newBoard);
        
        // 4. 重力適用
        await new Promise(res => setTimeout(res, 300;
        newBoard = applyGravity(newBoard);
        setGameBoard(newBoard);
        
        //5ってから次の連鎖判定
        await new Promise(res => setTimeout(res, 30;
        comboing = true;
      }
      
      if (comboWin) {
        setIsProcessing(false);
        return;
      }
      
      // 最後に置いた列の強調を少し後に消す
      setTimeout(() => setLastMoveColumn(null), 20);
      
      // スコア加算エフェクトを表示
      if (localScore1 > 0      const effectId = effectIdRef.current++;
        setScoreEffects(prev => [...prev, {
          id: effectId,
          isVisible: true,
          score: localScore1,
          playerType: 'player1',
          position: { x: window.innerWidth * 0.25window.innerHeight * 00.3      }]);
        setTimeout(() => {
          setScoreEffects(prev => prev.filter(effect => effect.id !== effectId));
        }, 150;
      }
      if (localScore2 > 0      const effectId = effectIdRef.current++;
        setScoreEffects(prev => [...prev, {
          id: effectId,
          isVisible: true,
          score: localScore2,
          playerType: 'player2',
          position: { x: window.innerWidth * 0.75window.innerHeight * 00.3      }]);
        setTimeout(() => {
          setScoreEffects(prev => prev.filter(effect => effect.id !== effectId));
        }, 1500);
      }
      
      // スコア加算
      if (localScore10setPlayer1(prev => ({ ...prev, score: prev.score + localScore1 }));
      if (localScore20setPlayer2(prev => ({ ...prev, score: prev.score + localScore2 }));
      
      // 3点先取勝利判定
      const p1Win = checkWinCondition(player1.score + localScore1, gameSettings.winScore);
      const p2Win = checkWinCondition(player2.score + localScore2, gameSettings.winScore);
      if (p1Win || p2Win)[object Object]       setGameOver(true);
        setResult({ result:win, winner: p1Win ? player1.name : player2me });
        setFinalBoard(newBoard);
        setFireworkVisible(true);
        setTimeout(() => setFireworkVisible(false), 300   setIsProcessing(false);
        return;
      }
      
      // 引き分け判定
      if (newBoard.every(row => row.every(cell => cell.state !== 'empty)))[object Object]       setGameOver(true);
        setResult({ result: draw' });
        setFinalBoard(newBoard);
        setIsProcessing(false);
        return;
      }
      
      // ターン交代
      setPlayer1(prev => ([object Object]...prev, isTurn: !prev.isTurn }));
      setPlayer2(prev => ([object Object]...prev, isTurn: !prev.isTurn }));
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
    }
  };

  // 列ホバー
  const handleColumnHover = (col: number) => {
    if (isProcessing || gameOver || !gameStarted) return;
    setHighlightedColumn(col);
  };
  const handleColumnLeave = () => setHighlightedColumn(null);

  // 再戦
  const handleRematch = () =>[object Object]
    router.push(`/offline-game?player1Name=${encodeURIComponent(player1.name)}&player2Name=${encodeURIComponent(player2.name)}&winScore=${gameSettings.winScore}&timeLimit=${gameSettings.timeLimit}`);
  };
  
  // ホーム
  const handleBackToHome = () => [object Object]
    switchToHomeBGM();
    router.push('/);
  };

  // プレイヤー2のターン時の回転スタイル
  const rotationStyle = player2.isTurn ? { transform: rotate(180 } : {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900ndigo-900 relative overflow-hidden">
      {/* BGM Control */}
      <div className="absolute top-4t-4 z-50       <BGMControlButton />
      </div>

      {/* Game Starting Overlay */}
      {gameStarting && !gameStarted && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50    <div className="text-center text-white>     <h2 className="text-3l font-bold mb-4">ゲーム開始</h2>
          [object Object]lotteryPhase && (
              <div className="text-xl>
                <p>先手を抽選中...</p>
                <div className="mt-4">
                  <div className="inline-block animate-bounce">
                    <div className="w-16-16gradient-to-r from-yellow-400orange-500 rounded-full flex items-center justify-center text-2nt-bold text-white shadow-lg">
                      🎯
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

  [object Object]/* First Turn Overlay */}
      {showFirstTurnOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50    <div className="text-center text-white">
            <div className="text-6ont-bold mb-4text-yellow-40>
              🎯
            </div>
            <h2 className="text-3l font-bold mb-2">先手決定！</h2>
            <p className="text-xl text-yellow-400t-semibold>{firstTurnPlayerName}</p>
          </div>
        </div>
      )}

[object Object]/* Connect4Effect */}
    [object Object]connect4Visible && (
        <div className="fixed inset-0 flex items-center justify-center z-40ointer-events-none">
          <div className="text-center">
            <div className="text-8l font-bold text-yellow-400 animate-bounce mb-4>
              🎯
            </div>
            <div className="text-4nt-bold text-white mb-2           Connect4!
            </div>
            <div className="text-2xl text-yellow-40>          {connect4Message}
            </div>
          </div>
        </div>
      )}

      {/* COMBO Effect */}
    [object Object]comboVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-40ointer-events-none">
          <div className="text-center">
            <div className="text-6 font-bold text-orange-500 animate-bounce mb-4>
              🔥
            </div>
            <div className="text-4nt-bold text-white mb-2
              COMBO!
            </div>
            <div className="text-2xl text-orange-40>              {comboCount}連鎖！
            </div>
          </div>
        </div>
      )}

[object Object]/* Firework Effect */}
    [object Object]fireworkVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-40ointer-events-none">
          <div className="text-center">
            <div className="text-8 animate-bounce">
              🎆
            </div>
          </div>
        </div>
      )}

      {/* Score Effects */}
     [object Object]scoreEffects.map(effect => (
        <div
          key={effect.id}
          className={`fixed z-30ointer-events-none transition-all duration-1500            effect.isVisible ? 'opacity-100translate-y0acity0 -translate-y-10     }`}
          style={[object Object]
            left: effect.position.x,
            top: effect.position.y,
            transform: effect.isVisible ?translateY(0)' : translateY(-40px)'
          }}
        >
          <div className={`text-2old ${
            effect.playerType ===player1 ?text-blue-400 : 'text-red-400  }`}>
            +{effect.score}
          </div>
        </div>
      ))}

      {/* Main Game Container */}
      <div className=container mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8     <h1 className="text-4nt-bold text-white mb-2バトル</h1>
          <p className=text-gray-30バイスで対戦</p>
        </div>

        {/* Game Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6-8        {/* Player 1 Info */}
          <div className="text-center">
            <div className="bg-white bg-opacity-10ed-lg p-4ackdrop-blur-sm>              <div className=flex items-center justify-center mb-2>
                <img
                  src={player1.avatar}
                  alt={player1.name}
                  className=w-12 h-12 rounded-full mr-3               />
                <div>
                  <h3 className="text-lg font-semibold text-white>{player1.name}</h3>
                  <p className=text-sm text-gray-300">プレイヤー1</p>
                </div>
              </div>
              <div className="text-2ont-bold text-blue-400-2>{player1.score}</div>
              <div className=text-sm text-gray-300">
                時間: {formatTime(timers.player1)}
              </div>
              {player1.isTurn && gameStarted && (
                <div className=mt-2xt-yellow-400 font-bold animate-pulse">
                  ← あなたのターン
                </div>
              )}
            </div>
          </div>

          {/* Game Settings */}
          <div className="text-center">
            <div className="bg-white bg-opacity-10ed-lg p-4ackdrop-blur-sm>
              <h3 className="text-lg font-semibold text-white mb-2">ゲーム設定</h3              <div className=text-sm text-gray-300 space-y-1>
                <p>勝利条件: {gameSettings.winScore}点先取</p>
                <p>時間制限: {gameSettings.timeLimit === 'none' ? 'なし' : gameSettings.timeLimit}</p>
              </div>
            </div>
          </div>

          {/* Player 2 Info */}
          <div className="text-center">
            <div className="bg-white bg-opacity-10ed-lg p-4ackdrop-blur-sm>              <div className=flex items-center justify-center mb-2>
                <img
                  src={player2.avatar}
                  alt={player2.name}
                  className=w-12 h-12 rounded-full mr-3               />
                <div>
                  <h3 className="text-lg font-semibold text-white>{player2.name}</h3>
                  <p className=text-sm text-gray-300">プレイヤー2</p>
                </div>
              </div>
              <div className="text-2font-bold text-red-400-2>{player2.score}</div>
              <div className=text-sm text-gray-300">
                時間: {formatTime(timers.player2)}
              </div>
              {player2.isTurn && gameStarted && (
                <div className=mt-2xt-yellow-400 font-bold animate-pulse">
                  あなたのターン →
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game Board Container with Rotation */}
        <div className="flex justify-center mb-8        <div style={rotationStyle} className="transition-transform duration-50
            <GameGrid
              board={gameBoard}
              onColumnClick={handleColumnClick}
              onColumnHover={handleColumnHover}
              onColumnLeave={handleColumnLeave}
              highlightedColumn={highlightedColumn}
              lastMoveColumn={lastMoveColumn}
              isProcessing={isProcessing}
              currentPlayer={player1.isTurn ? 'player1' : 'player2}      />
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-center space-x-4mb-8">
          <button
            onClick={() => setShowRules(true)}
            className=bg-blue-600 hover:bg-blue-70text-white px-6-3ounded-lg font-semibold transition-colors"
          >
            ルール説明
          </button>
          <button
            onClick={handleBackToHome}
            className=bg-gray-600 hover:bg-gray-70text-white px-6-3ounded-lg font-semibold transition-colors"
          >
            タイトルに戻る
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm>
          <p>オフラインモード - 同じデバイスで対戦</p>
        </div>
      </div>

      {/* Rules Popup */}
      <RulesPopup isOpen={showRules} onClose={() => setShowRules(false)} />

 [object Object]/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50    <div className="bg-white rounded-lg p-8max-w-md w-full mx-4 text-center>     <h2 className="text-3 font-bold mb-4>        [object Object]result?.result === win ?ゲーム終了！' : '引き分け！}
            </h2>
         [object Object]result?.result === 'win' && (
              <p className="text-xl mb-4">
                勝者: <span className="font-bold text-blue-60>{result.winner}</span>
              </p>
            )}
            <div className="space-y-4>           <button
                onClick={handleRematch}
                className="w-full bg-blue-600 hover:bg-blue-70white py-3ounded-lg font-semibold transition-colors>
                再戦
              </button>
              <button
                onClick={handleBackToHome}
                className="w-full bg-gray-600 hover:bg-gray-70white py-3ounded-lg font-semibold transition-colors>
                ホームに戻る
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 