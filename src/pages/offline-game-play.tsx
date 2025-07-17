import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { BGMControlButton } from '../components/BGMControlButton';
import { useBGM } from '../contexts/BGMContext';
import { useTheme } from '../contexts/ThemeContext';
import GameGrid from '../components/GameGrid';
import ScoreGauge from '../components/ScoreGauge';
import RulesPopup from '../components/RulesPopup';
import { CellState, PlayerInfo, GameSettings, DEFAULT_GAME_SETTINGS, PlayerType } from '../types/game';
import { createEmptyBoard, checkForCombos, applyGravity, checkWinCondition, isColumnFull } from '../utils/gameLogic';

export default function OfflineGamePlayPage() {
  const router = useRouter();
  const { switchToHomeBGM, switchToGameBGM } = useBGM();
  const { colors } = useTheme();

  // URLパラメータ取得
  const { player1Name, player2Name, winScore, timeLimit } = router.query;

  // デバッグ用ログ
  console.log("OfflineGamePlayPage loaded", { player1Name, player2Name, winScore, timeLimit, routerIsReady: router.isReady });

  // router.isReadyをチェック
  if (!router.isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100 to-white flex flex-col justify-center items-center font-noto">
        <div className="text-2xl font-bold text-gray-600">読み込み中...</div>
      </div>
    );
  }

  // ゲーム設定
  const gameSettings: GameSettings = {
    winScore: winScore ? parseInt(winScore as string) as 1 | 3 | 5 : DEFAULT_GAME_SETTINGS.winScore,
    timeLimit: (timeLimit as 'none' | '30s' | '1m') || DEFAULT_GAME_SETTINGS.timeLimit,
  };

  // プレイヤー情報
  const [player1, setPlayer1] = useState<PlayerInfo>({
    name: 'プレイヤー1',
    avatar: '/assets/Avater/Avater/normal_graycat.png',
    score: 0,
    isTurn: true,
    timer: 0,
    isActive: true,
    type: 'graycat',
  });
  const [player2, setPlayer2] = useState<PlayerInfo>({
    name: 'プレイヤー2',
    avatar: '/assets/Avater/Avater/normal_tiger.png',
    score: 0,
    isTurn: false,
    timer: 0,
    isActive: true,
    type: 'tiger',
  });

  // プレイヤー名を設定
  useEffect(() => {
    if (router.isReady && player1Name && player2Name) {
      setPlayer1(prev => ({ ...prev, name: player1Name as string }));
      setPlayer2(prev => ({ ...prev, name: player2Name as string }));
    }
  }, [router.isReady, player1Name, player2Name]);

  // ゲーム状態
  const [gameBoard, setGameBoard] = useState<CellState[][]>(createEmptyBoard());
  const [highlightedColumn, setHighlightedColumn] = useState<number | null>(null);
  const [lastMoveColumn, setLastMoveColumn] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timers, setTimers] = useState({ player1: 0, player2: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<{ result: 'win' | 'draw'; winner?: string } | null>(null);
  const [finalBoard, setFinalBoard] = useState<CellState[][] | null>(null);

  // Connect4/COMBO演出
  const [connect4Visible, setConnect4Visible] = useState(false);
  const [connect4Player, setConnect4Player] = useState<'player1' | 'player2' | null>(null);
  const [connect4Message, setConnect4Message] = useState('');
  const [comboVisible, setComboVisible] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [fireworkVisible, setFireworkVisible] = useState(false);
  const effectIdRef = useRef(0);
  const [scoreEffects, setScoreEffects] = useState<Array<{
    id: number;
    isVisible: boolean;
    score: number;
    playerType: 'player1' | 'player2';
    position: { x: number; y: number };
  }>>([]);

  // 先手抽選
  const [gameStarting, setGameStarting] = useState(false);
  const [lotteryPhase, setLotteryPhase] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<'player1' | 'player2' | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showFirstTurnOverlay, setShowFirstTurnOverlay] = useState(false);
  const [firstTurnPlayerName, setFirstTurnPlayerName] = useState('');

  // ルール説明
  const [showRules, setShowRules] = useState(false);

  // 先手抽選
  useEffect(() => {
    if (!router.isReady) return;
    
    if (player1Name && player2Name) {
      setGameStarting(true);
      setTimeout(() => {
        setLotteryPhase(true);
        const randomValue = Math.random();
        const firstTurn = randomValue < 0.5 ? 'player1' : 'player2';
        setSelectedPlayer(firstTurn);
        setTimeout(() => {
          setGameStarted(true);
          setFirstTurnPlayerName(firstTurn === 'player1' ? (player1Name as string) : (player2Name as string));
          setShowFirstTurnOverlay(true);
          setTimeout(() => {
            setShowFirstTurnOverlay(false);
            // 先手表示ポップアップが終わってからターンを設定
            setPlayer1(prev => ({ ...prev, isTurn: firstTurn === 'player1' }));
            setPlayer2(prev => ({ ...prev, isTurn: firstTurn === 'player2' }));
          }, 1700);
        }, 2500);
      }, 1500);
    } else {
      console.log("パラメータが不足しているため、オフライン対戦ページにリダイレクトします");
      router.push('/offline-game');
    }
  }, [router.isReady, player1Name, player2Name, router]);

  // タイマー
  useEffect(() => {
    if (gameStarted && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimers(prev => ({
          player1: player1.isTurn ? prev.player1 + 1 : prev.player1,
          player2: player2.isTurn ? prev.player2 + 1 : prev.player2,
        }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, gameOver, player1.isTurn, player2.isTurn]);

  // 時間表示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 列クリック
  const handleColumnClick = async (columnIndex: number) => {
    if (isProcessing || gameOver || !gameStarted) return;
    const playerType: PlayerType = player1.isTurn ? 'player1' : 'player2';
    if (isColumnFull(gameBoard, columnIndex)) return;
    // 一番下の空セルを探す
    let targetRow = -1;
    for (let row = gameBoard.length - 1; row >= 0; row--) {
      if (gameBoard[row][columnIndex].state === 'empty') {
        targetRow = row;
        break;
      }
    }
    if (targetRow === -1) return;
    setIsProcessing(true);
    setHighlightedColumn(null);
    setLastMoveColumn(columnIndex);
    try {
      // セルを置く
      let newBoard: CellState[][] = gameBoard.map((row, rIdx) =>
        row.map((cell, cIdx) => (rIdx === targetRow && cIdx === columnIndex ? { state: 'normal', player: playerType } : cell))
      );
      setGameBoard(newBoard);
      
      // 盤面が安定するまで連鎖判定
      let comboing = true;
      let localScore1 = 0;
      let localScore2 = 0;
      let comboChainCount = 0;
      let tempPlayer1Score = player1.score;
      let tempPlayer2Score = player2.score;
      let comboWin = false;
      
      while (comboing) {
        comboing = false;
        comboChainCount++;
        
        // 1. どちらのプレイヤーも4つ揃いがあるか判定
        const player1Combo = checkForCombos(newBoard, 'player1');
        const player2Combo = checkForCombos(newBoard, 'player2');
        
        // 2. プレイヤーごとに順次処理
        let foundCombo = false;
        let currentTurnPlayerCombo = null;
        let opponentPlayerCombo = null;
        
        // 現在のターンプレイヤーのconnect4を先に処理
        if (player1.isTurn && player1Combo.hasCombo) {
          currentTurnPlayerCombo = { type: 'player1' as PlayerType, result: player1Combo };
        } else if (player2.isTurn && player2Combo.hasCombo) {
          currentTurnPlayerCombo = { type: 'player2' as PlayerType, result: player2Combo };
        }
        
        // 相手プレイヤーのconnect4を後で処理
        if (player1.isTurn && player2Combo.hasCombo) {
          opponentPlayerCombo = { type: 'player2' as PlayerType, result: player2Combo };
        } else if (player2.isTurn && player1Combo.hasCombo) {
          opponentPlayerCombo = { type: 'player1' as PlayerType, result: player1Combo };
        }
        
        // 現在のターンプレイヤーのconnect4を処理
        if (currentTurnPlayerCombo) {
          foundCombo = true;
          const { type, result } = currentTurnPlayerCombo;
          const playerName = type === 'player1' ? player1.name : player2.name;
          
          // 星セル化
          newBoard = newBoard.map((row, rIdx) =>
            row.map((cell, cIdx) =>
              result.cellsToRemove.some(([rowIdx, colIdx]) => rowIdx === rIdx && colIdx === cIdx)
                ? { ...cell, state: 'star', player: type }
                : cell
            )
          );
          setGameBoard(newBoard);
          
          // スコア加算（即座に反映）
          if (type === 'player1') {
            localScore1++;
            tempPlayer1Score++;
            setPlayer1(prev => ({ ...prev, score: prev.score + 1 }));
          } else {
            localScore2++;
            tempPlayer2Score++;
            setPlayer2(prev => ({ ...prev, score: prev.score + 1 }));
          }
          
          // Connect4成立時の視覚的フィードバック
          setConnect4Player(type);
          setConnect4Message(`${playerName}がConnect4しました！`);
          setConnect4Visible(true);
          await new Promise(res => setTimeout(res, 2000));
          setConnect4Visible(false);
          setConnect4Player(null);
          setConnect4Message('');
          
          // 勝利判定（スコア加算後）
          if (checkWinCondition(tempPlayer1Score, gameSettings.winScore)) {
            setPlayer1(prev => ({ ...prev, score: tempPlayer1Score }));
            setPlayer2(prev => ({ ...prev, score: tempPlayer2Score }));
            setGameOver(true);
            setResult({ result: 'win', winner: player1.name });
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
            setResult({ result: 'win', winner: player2.name });
            setFinalBoard(newBoard);
            setFireworkVisible(true);
            setTimeout(() => setFireworkVisible(false), 3000);
            comboWin = true;
            break;
          }
          
          // 星セルを薄くする
          newBoard = newBoard.map((row, rIdx) =>
            row.map((cell, cIdx) =>
              result.cellsToRemove.some(([rowIdx, colIdx]) => rowIdx === rIdx && colIdx === cIdx)
                ? { ...cell, state: 'star', player: type, opacity: 0.3 }
                : cell
            )
          );
          setGameBoard(newBoard);
        }
        
        // 相手プレイヤーのconnect4を処理（現在のターンプレイヤーの処理が終わった後）
        if (opponentPlayerCombo) {
          foundCombo = true;
          const { type, result } = opponentPlayerCombo;
          const playerName = type === 'player1' ? player1.name : player2.name;
          
          // 星セル化
          newBoard = newBoard.map((row, rIdx) =>
            row.map((cell, cIdx) =>
              result.cellsToRemove.some(([rowIdx, colIdx]) => rowIdx === rIdx && colIdx === cIdx)
                ? { ...cell, state: 'star', player: type }
                : cell
            )
          );
          setGameBoard(newBoard);
          
          // スコア加算（即座に反映）
          if (type === 'player1') {
            localScore1++;
            tempPlayer1Score++;
            setPlayer1(prev => ({ ...prev, score: prev.score + 1 }));
          } else {
            localScore2++;
            tempPlayer2Score++;
            setPlayer2(prev => ({ ...prev, score: prev.score + 1 }));
          }
          
          // Connect4成立時の視覚的フィードバック
          setConnect4Player(type);
          setConnect4Message(`${playerName}がConnect4しました！`);
          setConnect4Visible(true);
          await new Promise(res => setTimeout(res, 2000));
          setConnect4Visible(false);
          setConnect4Player(null);
          setConnect4Message('');
          
          // 勝利判定（スコア加算後）
          if (checkWinCondition(tempPlayer1Score, gameSettings.winScore)) {
            setPlayer1(prev => ({ ...prev, score: tempPlayer1Score }));
            setPlayer2(prev => ({ ...prev, score: tempPlayer2Score }));
            setGameOver(true);
            setResult({ result: 'win', winner: player1.name });
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
            setResult({ result: 'win', winner: player2.name });
            setFinalBoard(newBoard);
            setFireworkVisible(true);
            setTimeout(() => setFireworkVisible(false), 3000);
            comboWin = true;
            break;
          }
          
          // 星セルを薄くする
          newBoard = newBoard.map((row, rIdx) =>
            row.map((cell, cIdx) =>
              result.cellsToRemove.some(([rowIdx, colIdx]) => rowIdx === rIdx && colIdx === cIdx)
                ? { ...cell, state: 'star', player: type, opacity: 0.3 }
                : cell
            )
          );
          setGameBoard(newBoard);
        }
        
        // 同じターンに同じプレイヤーのconnect4が複数回行われる場合のみCOMBO表示
        if (comboChainCount > 1 && foundCombo) {
          // 現在のターンプレイヤーのみコンボ表示
          const currentPlayerType = player1.isTurn ? 'player1' : 'player2';
          if ((currentTurnPlayerCombo && currentTurnPlayerCombo.type === currentPlayerType) ||
              (opponentPlayerCombo && opponentPlayerCombo.type === currentPlayerType)) {
            setComboCount(comboChainCount);
            setComboVisible(true);
            await new Promise(res => setTimeout(res, 2000));
            setComboVisible(false);
          }
        }
        
        if (!foundCombo) break;
        
        // 3. 薄くなったセルを消去（両プレイヤーのconnect4処理が終わった後）
        newBoard = newBoard.map(row =>
          row.map(cell =>
            cell.state === 'star' ? { state: 'empty' } : cell
          )
        );
        setGameBoard(newBoard);
        
        // 4. 重力適用
        await new Promise(res => setTimeout(res, 300));
        newBoard = applyGravity(newBoard);
        setGameBoard(newBoard);
        
        // 5. 少し待ってから次の連鎖判定
        await new Promise(res => setTimeout(res, 500));
        comboing = true;
      }
      
      if (comboWin) {
        // 勝者が決まった場合はconnect4セルを維持
        setIsProcessing(false);
        return;
      }
      
      // 最後に置いた列の強調を少し後に消す
      setTimeout(() => setLastMoveColumn(null), 2000);
      
      // 3点先取勝利判定
      const p1Win = checkWinCondition(player1.score, gameSettings.winScore);
      const p2Win = checkWinCondition(player2.score, gameSettings.winScore);
      if (p1Win || p2Win) {
        setGameOver(true);
        setResult({ result: 'win', winner: p1Win ? player1.name : player2.name });
        setFinalBoard(newBoard);
        setIsProcessing(false);
        return;
      }
      
      // 引き分け判定
      if (newBoard.every(row => row.every(cell => cell.state !== 'empty'))) {
        setGameOver(true);
        setResult({ result: 'draw' });
        setFinalBoard(newBoard);
        setIsProcessing(false);
        return;
      }
      
      // ターン交代（少し待ってから）
      setTimeout(() => {
        setPlayer1(prev => ({ ...prev, isTurn: !prev.isTurn }));
        setPlayer2(prev => ({ ...prev, isTurn: !prev.isTurn }));
        setIsProcessing(false);
      }, 800);
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
  const handleRematch = () => {
    // ゲームBGMに切り替え
    switchToGameBGM();
    
    // ゲーム状態をリセット
    setGameBoard(createEmptyBoard());
    setPlayer1(prev => ({ ...prev, score: 0, isTurn: false }));
    setPlayer2(prev => ({ ...prev, score: 0, isTurn: false }));
    setGameOver(false);
    setResult(null);
    setFinalBoard(null);
    setTimers({ player1: 0, player2: 0 });
    setScoreEffects([]);
    setConnect4Visible(false);
    setComboVisible(false);
    setFireworkVisible(false);
    setGameStarted(false);
    
    // 先手抽選を開始
    setGameStarting(true);
    setTimeout(() => {
      setLotteryPhase(true);
      const randomValue = Math.random();
      const firstTurn = randomValue < 0.5 ? 'player1' : 'player2';
      setSelectedPlayer(firstTurn);
      setTimeout(() => {
        setGameStarted(true);
        setPlayer1(prev => ({ ...prev, isTurn: firstTurn === 'player1' }));
        setPlayer2(prev => ({ ...prev, isTurn: firstTurn === 'player2' }));
        setFirstTurnPlayerName(firstTurn === 'player1' ? player1.name : player2.name);
        setShowFirstTurnOverlay(true);
        setTimeout(() => setShowFirstTurnOverlay(false), 1700);
      }, 2500);
    }, 1500);
  };
  // ホーム
  const handleBackToHome = () => {
    switchToHomeBGM();
    router.push('/');
  };

  // プレイヤー2のターン時に180度回転（先手表示ポップアップ中は反転しない）
  const isPlayer2Turn = player2.isTurn && !showFirstTurnOverlay;
  const rotationStyle = isPlayer2Turn ? { transform: 'rotate(180deg)' } : {};

  return (
    <main className="w-full min-h-screen flex flex-col items-center relative overflow-hidden">
      {/* 背景グラデーションのみ半透明 */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-50 via-emerald-100 to-white" style={{ opacity: 0.5, zIndex: 0 }} />
      <div className="relative z-10 w-full flex flex-col items-center">
        {/* タイトル */}
        <div className="w-full flex flex-col items-center mt-4 mb-2">
          <div className="text-xl sm:text-2xl font-bold text-black tracking-tight drop-shadow-sm">connect4plus</div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1 font-semibold">次世代型立体四目並べ</div>
        </div>

        {/* ゲーム開始・先手抽選画面 */}
        {gameStarting && !gameStarted && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm text-center border-2 border-emerald-300">
              <div className="text-4xl sm:text-6xl font-extrabold text-emerald-600 mb-2 sm:mb-4 animate-bounce leading-tight">GAME START!</div>
              <div className="text-lg sm:text-2xl font-bold text-gray-700 mb-1 sm:mb-2 leading-tight">ゲーム開始！</div>
              {/* both_fighting画像を表示 */}
              <img src="/assets/Avater/PosingAvater/both_fighting.png" alt="両者ファイティング" className="w-28 h-28 sm:w-40 sm:h-40 object-contain mx-auto mb-2 sm:mb-4" />
              {/* 抽選演出 */}
              <div className="mb-4 sm:mb-6 w-full flex flex-col items-center">
                <div className="text-base sm:text-xl font-bold text-gray-700 mb-1 sm:mb-2">
                  {lotteryPhase ? '先手が決まりました！' : '先手を抽選中...'}
                </div>
                <div className="flex justify-center items-center gap-4 sm:gap-8 mb-2 sm:mb-4 w-full">
                  <div className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-base sm:text-lg font-bold transition-all duration-500 ${lotteryPhase && selectedPlayer === 'player1' ? 'scale-110 shadow-lg' : 'bg-gray-200 text-gray-600'}`} style={lotteryPhase && selectedPlayer === 'player1' ? { backgroundColor: colors.player1Color, color: 'white' } : {}}>{player1.name}</div>
                  <div className="text-lg sm:text-2xl font-bold text-gray-400">VS</div>
                  <div className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-base sm:text-lg font-bold transition-all duration-500 ${lotteryPhase && selectedPlayer === 'player2' ? 'scale-110 shadow-lg' : 'bg-gray-200 text-gray-600'}`} style={lotteryPhase && selectedPlayer === 'player2' ? { backgroundColor: colors.player2Color, color: 'white' } : {}}>{player2.name}</div>
                </div>
                <div className={`w-10 h-10 sm:w-16 sm:h-16 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto ${lotteryPhase ? 'animate-pulse' : 'animate-spin'}`}></div>
              </div>
            </div>
          </div>
        )}

        {/* 先手表示オーバーレイ */}
        {showFirstTurnOverlay && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-sm text-center border-2 border-emerald-300">
              <div className="text-2xl font-bold text-emerald-600 mb-4">ゲーム開始！</div>
              <div className="text-xl font-semibold text-gray-700 bg-emerald-50 rounded-lg p-3">
                <span 
                  className="font-bold"
                  style={{ 
                    color: firstTurnPlayerName === player1.name ? colors.player1Color : colors.player2Color,
                    textShadow: '0 0 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {firstTurnPlayerName}
                </span>
                から始めます。
              </div>
            </div>
          </div>
        )}

        {/* User情報とゲーム盤面（一体となって回転） */}
        <div className="flex flex-col items-center w-full" style={rotationStyle}>
          {/* User情報 */}
          <div className="flex flex-row justify-center items-end gap-4 sm:gap-12 w-full max-w-4xl mt-2 mb-4">
            {/* Player1 */}
            <div className={`flex flex-col items-center transition-all duration-300 ${player1.isTurn ? 'ring-2 ring-emerald-400 shadow bg-white' : 'bg-white/60'} rounded-xl px-4 py-2 sm:px-6 sm:py-3 min-w-[120px] sm:min-w-[160px]`}> 
              <img src={player1.avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow border border-emerald-200" />
              <div className="text-base sm:text-lg font-bold mt-1 text-gray-800 flex items-center gap-1">
                {player1.name}
                <span className="inline-block w-3 h-3 rounded-full border border-gray-300" style={{ background: colors.player1Color }} title="プレイヤー1のコマ色" />
              </div>
              <div className="text-gray-500 text-xs sm:text-base font-mono tracking-wider">{formatTime(timers.player1)}</div>
              <div className="w-16 sm:w-20 mt-2 flex justify-center"><ScoreGauge score={player1.score} maxScore={gameSettings.winScore} playerType={player1.type} /></div>
            </div>
            {/* VS */}
            <div className="text-lg sm:text-2xl font-extrabold text-gray-400 mb-6 select-none">VS</div>
            {/* Player2 */}
            <div className={`flex flex-col items-center transition-all duration-300 ${player2.isTurn ? 'ring-2 ring-emerald-400 shadow bg-white' : 'bg-white/60'} rounded-xl px-4 py-2 sm:px-6 sm:py-3 min-w-[120px] sm:min-w-[160px]`}>
              <img src={player2.avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow border border-emerald-200" />
              <div className="text-base sm:text-lg font-bold mt-1 text-gray-800 flex items-center gap-1">
                {player2.name}
                <span className="inline-block w-3 h-3 rounded-full border border-gray-300" style={{ background: colors.player2Color }} title="プレイヤー2のコマ色" />
              </div>
              <div className="text-gray-500 text-xs sm:text-base font-mono tracking-wider">{formatTime(timers.player2)}</div>
              <div className="w-16 sm:w-20 mt-2 flex justify-center"><ScoreGauge score={player2.score} maxScore={gameSettings.winScore} playerType={player2.type} /></div>
            </div>
          </div>

          {/* ゲーム盤面 */}
          <div className="flex justify-center items-center">
            <div className="rounded-3xl shadow-2xl p-4 bg-[#D9F2E1]">
              <GameGrid
                board={gameBoard}
                highlightedColumn={highlightedColumn}
                lastMoveColumn={lastMoveColumn}
                onColumnClick={handleColumnClick}
                onColumnHover={handleColumnHover}
                onColumnLeave={handleColumnLeave}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>

        {/* Presented by & ボタン群（回転対象外） */}
        <div className="flex flex-col items-center w-full mt-8">
          <div className="text-sm text-gray-500 font-semibold mb-4">Presented by Kotaro Design Lab.</div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowRules(true)}
              className="px-6 py-2 bg-emerald-400 text-white rounded-full text-base font-semibold shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors min-h-[44px]"
              aria-label="ゲームルールを表示"
            >
              📖 ルール説明
            </button>
            <button
              onClick={handleBackToHome}
              className="px-6 py-2 bg-gray-400 text-white rounded-full text-base font-semibold shadow hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors min-h-[44px]"
              aria-label="タイトルに戻る"
            >
              🏠 タイトルに戻る
            </button>
            {/* もう一度遊ぶボタンは対戦中は非表示 */}
            {gameOver && (
              <button
                onClick={handleRematch}
                className="px-6 py-2 bg-emerald-400 text-white rounded-full text-base font-semibold shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors min-h-[44px]"
                aria-label="もう一度遊ぶ"
              >
                もう一度遊ぶ
              </button>
            )}
          </div>
        </div>

        {/* Connect4演出（プレイヤー2のターン時は反転） */}
        {connect4Visible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-xl p-6 mx-4 max-w-sm text-center border-2 border-emerald-300" style={isPlayer2Turn ? { transform: 'rotate(180deg)' } : {}}>
              <div className="text-4xl mb-3 text-emerald-500">⭐</div>
              <div className="text-xl font-bold text-emerald-600 mb-2">Connect4!</div>
              <div className="text-base font-semibold text-gray-700 bg-white rounded-lg p-2">
                {connect4Message}
              </div>
            </div>
          </div>
        )}

        {/* COMBO演出（プレイヤー2のターン時は反転） */}
        {comboVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-xl p-6 mx-4 max-w-sm text-center border-2 border-orange-300" style={isPlayer2Turn ? { transform: 'rotate(180deg)' } : {}}>
              <div className="text-4xl mb-3 text-orange-500">🔥</div>
              <div className="text-xl font-bold text-orange-600 mb-2">COMBO!</div>
              <div className="text-base font-semibold text-gray-700 bg-white rounded-lg p-2">
                {comboCount}連鎖
              </div>
            </div>
          </div>
        )}

        {/* スコアエフェクト（削除） */}

        {/* 結果モーダル */}
        {gameOver && result && finalBoard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center w-full max-w-xs sm:max-w-md min-h-[280px] sm:min-h-[340px]">
              {/* 勝者アバターを大きく前面に */}
              {result.result === 'win' && (
                <div className="flex flex-col items-center -mt-16 sm:-mt-24 mb-2 sm:mb-4 z-10">
                  <img
                    src={result.winner === player1.name ? '/assets/Avater/Avater/happy_graycat.png' : '/assets/Avater/Avater/happy_tiger.png'}
                    className="w-24 h-24 sm:w-40 sm:h-40 rounded-full shadow-2xl border-4 border-emerald-400"
                    style={{ objectFit: 'cover' }}
                    alt="Winner Avatar"
                  />
                  <div className="mt-2 text-sm text-gray-600">勝者</div>
                </div>
              )}
              {result.result === 'draw' && (
                <div className="flex flex-col items-center -mt-16 sm:-mt-24 mb-2 sm:mb-4 z-10">
                  <div className="flex gap-2">
                    <img
                      src="/assets/Avater/Avater/crying_graycat.png"
                      className="w-20 h-20 sm:w-32 sm:h-32 rounded-full shadow-2xl border-4 border-gray-400"
                      style={{ objectFit: 'cover' }}
                      alt="Player 1 Avatar"
                    />
                    <img
                      src="/assets/Avater/Avater/crying_tiger.png"
                      className="w-20 h-20 sm:w-32 sm:h-32 rounded-full shadow-2xl border-4 border-gray-400"
                      style={{ objectFit: 'cover' }}
                      alt="Player 2 Avatar"
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">引き分け</div>
                </div>
              )}
              <div className="text-2xl sm:text-4xl font-extrabold text-emerald-500 mb-2 text-center">
                {result.result === 'win' ? `${result.winner} の勝ち！` : '引き分け'}
              </div>
              <div className="w-full flex justify-center mb-3 sm:mb-4">
                <div className="scale-75 sm:scale-100">
                  <GameGrid board={finalBoard} />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleBackToHome}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                >
                  ゲームを終わる
                </button>
                <button
                  onClick={handleRematch}
                  className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
                >
                  もう一戦！！
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 花火演出（削除） */}

        {/* ルール説明ポップアップ */}
        {showRules && (
          <RulesPopup isVisible={showRules} onClose={() => setShowRules(false)} />
        )}

        {/* BGMコントロールボタン（固定位置） */}
        <div className="fixed bottom-4 right-4 z-50">
          <BGMControlButton size="medium" className="shadow-2xl hover:shadow-3xl" />
        </div>
      </div>
    </main>
  );
} 