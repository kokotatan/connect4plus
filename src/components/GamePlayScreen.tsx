import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import ScoreGauge from '../components/ScoreGauge';
import GameGrid from '../components/GameGrid';
import { GameEffects } from '../components/GameEffects';
import RulesPopup from '../components/RulesPopup';
import { BGMControlButton } from '../components/BGMControlButton';
import { useBGM } from '../contexts/BGMContext';
import { CellState, PlayerType, PlayerInfo } from '../types/game';
import { createEmptyBoard, checkForConnect4, isColumnFull, applyGravity, checkForCombos, checkForCombosAfterGravity, checkWinCondition } from '../utils/gameLogic';
import { ref, set, onValue, off, update } from 'firebase/database';
import { db, getPlayerInfo, PlayerInfo as FirebasePlayerInfo } from '../utils/firebase';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '../types/game';

interface GamePlayScreenProps {
  player1: PlayerInfo;
  player2: PlayerInfo;
  onGameEnd?: (winner: string | null) => void;
  roomId?: string;
  isOnlineMode?: boolean;
  gameSettings?: GameSettings;
}

const AVATERS = {
  player1: '/assets/Avater/Avater/normal_graycat.png',
  player2: '/assets/Avater/Avater/normal_tiger.png',
};

export default function GamePlayScreen({ 
  player1: initialPlayer1,
  player2: initialPlayer2,
  onGameEnd,
  roomId,
  isOnlineMode = false,
  gameSettings = DEFAULT_GAME_SETTINGS
}: GamePlayScreenProps) {
  const router = useRouter();
  const { switchToHomeBGM } = useBGM();
  const [player1, setPlayer1] = useState<PlayerInfo>({ ...initialPlayer1, avatar: AVATERS.player1 });
  const [player2, setPlayer2] = useState<PlayerInfo>({ ...initialPlayer2, avatar: AVATERS.player2 });
  const [gameBoard, setGameBoard] = useState<CellState[][]>(createEmptyBoard());
  const [highlightedColumn, setHighlightedColumn] = useState<number | null>(null);
  const [lastMoveColumn, setLastMoveColumn] = useState<number | null>(null);
  const [lastMoveRow, setLastMoveRow] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timers, setTimers] = useState({ player1: 0, player2: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<{ result: 'win' | 'lose' | 'draw'; winner?: string } | null>(null);
  const [finalBoard, setFinalBoard] = useState<CellState[][] | null>(null);

  // セッション情報からプレイヤーを識別
  const [currentPlayerInfo, setCurrentPlayerInfo] = useState<FirebasePlayerInfo | null>(null);
  const [currentPlayerType, setCurrentPlayerType] = useState<'player1' | 'player2' | null>(null);

  useEffect(() => {
    if (isOnlineMode) {
      const playerInfo = getPlayerInfo();
      console.log('セッション情報取得:', playerInfo);
      setCurrentPlayerInfo(playerInfo);
      
      // プレイヤータイプを設定
      if (playerInfo) {
        if (playerInfo.isPlayer1) {
          setCurrentPlayerType('player1');
          setPlayer1(prev => ({ ...prev, name: playerInfo.playerName }));
        } else if (playerInfo.isPlayer2) {
          setCurrentPlayerType('player2');
          setPlayer2(prev => ({ ...prev, name: playerInfo.playerName }));
        }
      }
    }
  }, [isOnlineMode]);

  // 演出用の状態
  const [comboVisible, setComboVisible] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [scoreEffects, setScoreEffects] = useState<Array<{
    id: number;
    isVisible: boolean;
    score: number;
    playerType: 'player1' | 'player2';
    position: { x: number; y: number };
  }>>([]);
  const [fireworkVisible, setFireworkVisible] = useState(false);
  const effectIdRef = useRef(0);

  // Connect4表示改善用の状態
  const [connect4Visible, setConnect4Visible] = useState(false);
  const [connect4Player, setConnect4Player] = useState<'player1' | 'player2' | null>(null);
  const [connect4Message, setConnect4Message] = useState('');

  // ルール説明ポップアップの状態
  const [showRules, setShowRules] = useState(false);

  // Firebase同期（オンラインモード時）
  useEffect(() => {
    if (!isOnlineMode || !roomId) return;

    const gameStateRef = ref(db, `rooms/${roomId}/gameState`);
    
    // Firebaseからゲーム状態を監視
    const unsubscribe = onValue(gameStateRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // 初期状態の場合は、既存の状態を保持
        if (!gameBoard.some(row => row.some(cell => cell.state !== 'empty'))) {
          // 空の盤面の場合のみ初期状態を設定
          setGameBoard(data.board || createEmptyBoard());
        } else {
          // ゲーム進行中の場合は、処理中でない場合のみ更新
          if (!isProcessing) {
            setGameBoard(data.board || createEmptyBoard());
          }
        }
        
        // プレイヤー情報の更新（自分の情報は保持）
        setPlayer1(prev => ({ 
          ...prev, 
          isTurn: data.currentTurn === 'player1', 
          score: data.player1Score || 0,
          name: currentPlayerType === 'player1' ? prev.name : (data.player1Name || prev.name)
        }));
        setPlayer2(prev => ({ 
          ...prev, 
          isTurn: data.currentTurn === 'player2', 
          score: data.player2Score || 0,
          name: currentPlayerType === 'player2' ? prev.name : (data.player2Name || prev.name)
        }));
        setGameOver(data.gameOver || false);

        // ゲーム終了時の処理
        if (data.gameOver && !gameOver) {
          if (data.winner) {
            setResult({ result: 'win', winner: data.winner });
          } else {
            setResult({ result: 'draw' });
          }
          setFinalBoard(data.board);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isOnlineMode, roomId, isProcessing, currentPlayerType, gameOver]);

  // ゲーム状態をFirebaseに同期（オンラインモード時）
  const syncGameState = (newBoard: CellState[][], newPlayer1: PlayerInfo, newPlayer2: PlayerInfo, newGameOver: boolean, newWinner?: string) => {
    if (!isOnlineMode || !roomId) return;

    const gameStateRef = ref(db, `rooms/${roomId}/gameState`);
    set(gameStateRef, {
      board: newBoard,
      currentTurn: newPlayer1.isTurn ? 'player1' : 'player2',
      player1Score: newPlayer1.score,
      player2Score: newPlayer2.score,
      player1Name: newPlayer1.name,
      player2Name: newPlayer2.name,
      gameOver: newGameOver,
      winner: newWinner || null
    });
  };

  // タイマー: 自分の番の時だけ増える
  useEffect(() => {
    if (gameOver) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimers(prev => {
        if (player1.isTurn) return { ...prev, player1: prev.player1 + 1 };
        if (player2.isTurn) return { ...prev, player2: prev.player2 + 1 };
        return prev;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [player1.isTurn, player2.isTurn, gameOver]);

  // セルを置く（connect4+連鎖・重力・スコア・3点先取）
  const handleColumnClick = async (columnIndex: number) => {
    if (isProcessing || gameOver) return;
    
    // オンラインモード時は自分の番でないと操作不可
    if (isOnlineMode) {
      const playerInfo = getPlayerInfo();
      
      console.log('操作制限チェック:', {
        playerInfo,
        currentPlayerType,
        player1Turn: player1.isTurn,
        player2Turn: player2.isTurn,
        currentTurn: player1.isTurn ? 'player1' : 'player2'
      });
      
      // プレイヤータイプを確認
      if (!currentPlayerType) {
        console.log('操作を無視: プレイヤータイプが不明');
        return;
      }
      
      // 自分の番でない場合は操作を無視
      const isMyTurn = (currentPlayerType === 'player1' && player1.isTurn) || 
                       (currentPlayerType === 'player2' && player2.isTurn);
      
      if (!isMyTurn) {
        console.log('操作を無視: 自分の番ではありません', {
          currentPlayerType,
          player1Turn: player1.isTurn,
          player2Turn: player2.isTurn
        });
        return;
      }
      
      console.log('操作許可: 自分の番です', { currentPlayerType });
    }
    
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
    setHighlightedColumn(null); // コマを置いた直後にホバー解除
    
    try {
      // セルを置く
      let newBoard: CellState[][] = gameBoard.map((row, rIdx) =>
        row.map((cell, cIdx) => (rIdx === targetRow && cIdx === columnIndex ? { state: 'normal', player: playerType } : cell))
    );
      setGameBoard(newBoard);
      setLastMoveColumn(columnIndex);
      setLastMoveRow(targetRow);
    
      // 盤面が安定するまで両プレイヤーで連鎖判定
      let comboing = true;
      let localScore1 = 0;
      let localScore2 = 0;
      let comboChainCount = 0;
      let tempPlayer1Score = player1.score;
      let tempPlayer2Score = player2.score;
      let comboWin = false;
      let hasComboOccurred = false; // COMBOが実際に発生したかどうか
      
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
          const isMyConnect4 = (currentPlayerType === 'player1' && type === 'player1') || 
                               (currentPlayerType === 'player2' && type === 'player2');
        
          // Connect4成立時の視覚的フィードバック
          setConnect4Player(type === 'player1' ? 'player1' : 'player2');
          setConnect4Message(
            isMyConnect4 
              ? `${playerName}がConnect4しました！` 
              : `${playerName}がConnect4しました！`
          );
          setConnect4Visible(true);
        
          // Connect4表示を2秒間表示（相手のConnect4も見やすく）
        setTimeout(() => {
            setConnect4Visible(false);
            setConnect4Player(null);
            setConnect4Message('');
          }, 2000); // 1.5秒 → 2秒
          
          newBoard = newBoard.map((row, rIdx) =>
            row.map((cell, cIdx) =>
              result.cellsToRemove.some(([rowIdx, colIdx]) => rowIdx === rIdx && colIdx === cIdx)
                ? { ...cell, state: 'star', player: type }
                : cell
            )
          ) as CellState[][];
          setGameBoard(newBoard);
          if (type === 'player1') {
            localScore1++;
            tempPlayer1Score++;
          }
          if (type === 'player2') {
            localScore2++;
            tempPlayer2Score++;
          }
        }
        
        // 相手プレイヤーのconnect4を処理（現在のターンプレイヤーの処理が終わった後）
        if (opponentPlayerCombo) {
          foundCombo = true;
          const { type, result } = opponentPlayerCombo;
          const playerName = type === 'player1' ? player1.name : player2.name;
          const isMyConnect4 = (currentPlayerType === 'player1' && type === 'player1') || 
                               (currentPlayerType === 'player2' && type === 'player2');
          
          // Connect4成立時の視覚的フィードバック
          setConnect4Player(type === 'player1' ? 'player1' : 'player2');
          setConnect4Message(
            isMyConnect4 
              ? `${playerName}がConnect4しました！` 
              : `${playerName}がConnect4しました！`
          );
          setConnect4Visible(true);
          
          // Connect4表示を2秒間表示（相手のConnect4も見やすく）
          setTimeout(() => {
            setConnect4Visible(false);
            setConnect4Player(null);
            setConnect4Message('');
          }, 2000); // 1.5秒 → 2秒
          
          newBoard = newBoard.map((row, rIdx) =>
            row.map((cell, cIdx) =>
              result.cellsToRemove.some(([rowIdx, colIdx]) => rowIdx === rIdx && colIdx === cIdx)
                ? { ...cell, state: 'star', player: type }
                : cell
            )
          ) as CellState[][];
          setGameBoard(newBoard);
          if (type === 'player1') {
            localScore1++;
            tempPlayer1Score++;
              }
          if (type === 'player2') {
            localScore2++;
            tempPlayer2Score++;
          }
        }
        
        if (!foundCombo) break;
              
        // COMBO!演出を表示（2回目以降のCOMBOで、実際にCOMBOが発生した場合のみ）
        if (comboChainCount > 1 && hasComboOccurred) {
          setComboCount(comboChainCount);
          setComboVisible(true);
          setTimeout(() => setComboVisible(false), 2000);
        }

        // 3. 星セルを一定時間後に消去（両プレイヤーのconnect4処理が終わった後）
        await new Promise(res => setTimeout(res, 1200)); // 1500ms → 1200ms
        [currentTurnPlayerCombo, opponentPlayerCombo].forEach((combo) => {
          if (combo && combo.result.hasCombo) {
            newBoard = newBoard.map((row, rIdx) =>
              row.map((cell, cIdx) =>
                combo.result.cellsToRemove.some(([rowIdx, colIdx]) => rowIdx === rIdx && colIdx === cIdx)
                  ? { state: 'empty' }
                  : cell
              )
            );
      }
        });
        setGameBoard(newBoard);
        // 4. 重力適用
        await new Promise(res => setTimeout(res, 300));
        newBoard = applyGravity(newBoard);
        setGameBoard(newBoard);
        // 5. 少し待ってから次の連鎖判定
        await new Promise(res => setTimeout(res, 300));
        
        // 重力適用後のConnect4判定（下から順に処理）
        const player1ComboAfterGravity = checkForCombosAfterGravity(newBoard, 'player1');
        const player2ComboAfterGravity = checkForCombosAfterGravity(newBoard, 'player2');
        
        // 重力適用後に新たなConnect4がある場合は連鎖を継続
        if (player1ComboAfterGravity.hasCombo || player2ComboAfterGravity.hasCombo) {
          comboing = true;
        }
      }
      
      // スコア加算エフェクトを表示
      if (localScore1 > 0) {
        const effectId = effectIdRef.current++;
        setScoreEffects(prev => [...prev, {
          id: effectId,
          isVisible: true,
          score: localScore1,
          playerType: 'player1',
          position: { x: window.innerWidth * 0.25, y: window.innerHeight * 0.3 }
        }]);
        setTimeout(() => {
          setScoreEffects(prev => prev.filter(effect => effect.id !== effectId));
        }, 1500);
      }
      if (localScore2 > 0) {
        const effectId = effectIdRef.current++;
        setScoreEffects(prev => [...prev, {
          id: effectId,
          isVisible: true,
          score: localScore2,
          playerType: 'player2',
          position: { x: window.innerWidth * 0.75, y: window.innerHeight * 0.3 }
        }]);
          setTimeout(() => {
          setScoreEffects(prev => prev.filter(effect => effect.id !== effectId));
        }, 1500);
      }
      
      // スコア加算
      const newPlayer1 = { ...player1, score: player1.score + localScore1, isTurn: !player1.isTurn };
      const newPlayer2 = { ...player2, score: player2.score + localScore2, isTurn: !player2.isTurn };
      setPlayer1(newPlayer1);
      setPlayer2(newPlayer2);

      // 3点先取勝利判定
      const p1Win = checkWinCondition(newPlayer1.score, gameSettings.winScore);
      const p2Win = checkWinCondition(newPlayer2.score, gameSettings.winScore);
      if (p1Win || p2Win) {
        setGameOver(true);
        const winner = p1Win ? player1.name : player2.name;
        setResult({ result: 'win', winner });
        setFinalBoard(newBoard);
        setLastMoveColumn(null);
        setLastMoveRow(null);
        // 勝利時の花火エフェクト
        setFireworkVisible(true);
        setTimeout(() => setFireworkVisible(false), 3000);
        syncGameState(newBoard, newPlayer1, newPlayer2, true, winner);
        setIsProcessing(false);
            return;
          }
      
      // 引き分け判定
      if (newBoard.every(row => row.every(cell => cell.state !== 'empty'))) {
        setGameOver(true);
        setResult({ result: 'draw' });
        setFinalBoard(newBoard);
        setLastMoveColumn(null);
        setLastMoveRow(null);
        syncGameState(newBoard, newPlayer1, newPlayer2, true);
        setIsProcessing(false);
        return;
      }
      
      // オンラインモード時はFirebaseに同期
      if (isOnlineMode) {
        syncGameState(newBoard, newPlayer1, newPlayer2, false);
      }

      setIsProcessing(false);
    } catch (error) {
      console.error('ゲーム処理エラー:', error);
      setIsProcessing(false);
    }
  };

  // ハイライト
  const handleColumnHover = (col: number) => {
    if (isProcessing || gameOver) return;
    if (isOnlineMode) {
      // 自分の番でなければ何もしない
      const playerInfo = getPlayerInfo();
      const isMyTurn = (currentPlayerType === 'player1' && player1.isTurn) || 
                       (currentPlayerType === 'player2' && player2.isTurn);
      if (!isMyTurn) return;
    }
    setHighlightedColumn(col);
  };
  const handleColumnLeave = () => {
    if (isProcessing || gameOver) return;
    if (isOnlineMode) {
      const playerInfo = getPlayerInfo();
      const isMyTurn = (currentPlayerType === 'player1' && player1.isTurn) || 
                       (currentPlayerType === 'player2' && player2.isTurn);
      if (!isMyTurn) return;
    }
    setHighlightedColumn(null);
  };

  // タイマー表示
  const formatTime = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  // 再戦ボタン押下時
  const handleRematch = () => {
    // オンラインモード時はルームの対戦待機画面に移動（ルームID付き）
    if (isOnlineMode && roomId) {
      // 再戦時はBGMを継続（フェードアウトしない）
      // ready状態をリセットしてから遷移
      const readyRef = ref(db, `rooms/${roomId}/ready`);
      set(readyRef, { player1: false, player2: false });
      router.push(`/waitingForOpponent?roomId=${roomId}`);
      return;
    }
    // オフライン・AI戦の場合は従来通り
    setTimeout(() => {
      router.push('/waitingForOpponent');
    }, 500);
  };

  // タイトルに戻るボタン押下時
  const handleGoHome = () => {
    // ホームBGMに切り替えてから遷移
    switchToHomeBGM();
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  // UI
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
        {/* User情報 */}
        <div className="flex flex-row justify-center items-end gap-4 sm:gap-12 w-full max-w-2xl mt-2 mb-4">
          {/* Player1 */}
          <div className={`flex flex-col items-center transition-all duration-300 ${player1.isTurn ? 'ring-2 ring-emerald-400 shadow bg-white' : 'bg-white/60'} rounded-xl px-2 py-1 sm:px-3 sm:py-2`}> 
            <img src={player1.avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow border border-emerald-200" />
            <div className="text-base sm:text-lg font-bold mt-1 text-gray-800 flex items-center gap-1">
              {player1.name}
              <span className="inline-block w-3 h-3 rounded-full border border-gray-300" style={{ background: '#4D6869' }} title="あなたのコマ色" />
            </div>
            <div className="text-gray-500 text-xs sm:text-base font-mono tracking-wider">{formatTime(timers.player1)}</div>
            <div className="w-full mt-1 flex justify-center"><ScoreGauge score={player1.score} maxScore={gameSettings.winScore} playerType={player1.type} /></div>
          </div>
          {/* VS */}
          <div className="text-lg sm:text-2xl font-extrabold text-gray-400 mb-6 select-none">VS</div>
          {/* Player2 */}
          <div className={`flex flex-col items-center transition-all duration-300 ${player2.isTurn ? 'ring-2 ring-emerald-400 shadow bg-white' : 'bg-white/60'} rounded-xl px-2 py-1 sm:px-3 sm:py-2`}>
            <img src={player2.avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow border border-emerald-200" />
            <div className="text-base sm:text-lg font-bold mt-1 text-gray-800 flex items-center gap-1">
              {player2.name}
              <span className="inline-block w-3 h-3 rounded-full border border-gray-300" style={{ background: '#55B89C' }} title="あなたのコマ色" />
            </div>
            <div className="text-gray-500 text-xs sm:text-base font-mono tracking-wider">{formatTime(timers.player2)}</div>
            <div className="w-full mt-1 flex justify-center"><ScoreGauge score={player2.score} maxScore={gameSettings.winScore} playerType={player2.type} /></div>
          </div>
        </div>
        {/* ゲーム盤面 */}
        <div className="flex flex-col items-center w-full">
          <div className="flex justify-center items-center">
            <div className="rounded-3xl shadow-2xl p-4 bg-[#D9F2E1]">
              <GameGrid
                board={gameBoard}
                highlightedColumn={highlightedColumn}
                lastMoveColumn={lastMoveColumn}
                lastMoveRow={lastMoveRow}
                onColumnClick={handleColumnClick}
                onColumnHover={handleColumnHover}
                onColumnLeave={handleColumnLeave}
              />
            </div>
          </div>
          {/* Presented by & ボタン群 */}
          <div className="flex flex-col items-center w-full mt-8">
            {/* ルームID表示（オンラインモード時のみ） */}
            {isOnlineMode && roomId && (
              <div className="text-sm text-gray-400 font-semibold mb-4">
                ルームID: <span className="text-blue-500 font-bold">{roomId}</span>
          </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => setShowRules(true)}
                className="px-6 py-2 bg-emerald-400 text-white rounded-full text-base font-semibold shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors min-h-[44px]"
                aria-label="ゲームルールを表示"
              >
                📖 ルール説明
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
        </div>

        {/* Presented byを一番下に移動 */}
        <div className="w-full flex justify-center mt-8 mb-4">
          <div className="text-sm text-gray-500 font-semibold">
            © 2025 Kotaro Design Lab. All rights reserved.
          </div>
        </div>
        {/* 結果モーダル */}
        {gameOver && result && finalBoard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 flex flex-col items-center w-full max-w-xs sm:max-w-md min-h-[240px] sm:min-h-[300px]">
              {/* 勝者アバターを小さくして見切れを防ぐ */}
              {result.result === 'win' && (
                <div className="flex flex-col items-center -mt-12 sm:-mt-16 mb-2 sm:mb-3 z-10">
                  <img
                    src={result.winner === player1.name ? player1.avatar : player2.avatar}
                    className="w-16 h-16 sm:w-24 sm:h-24 rounded-full shadow-2xl border-4 border-emerald-400"
                    style={{ objectFit: 'cover' }}
                    alt="Winner Avatar"
                  />
                  <div className="mt-1 text-xs text-gray-600">勝者</div>
                </div>
              )}
              <div className="text-xl sm:text-3xl font-extrabold text-emerald-500 mb-2 text-center whitespace-nowrap">
                {result.result === 'win' ? `${result.winner}の勝ち！` : '引き分け'}
              </div>
              <div className="w-full flex justify-center mb-2 sm:mb-3">
                <div className="scale-75 sm:scale-100">
                  <GameGrid board={finalBoard} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-4 w-full">
                <button
                  onClick={handleGoHome}
                  className="px-4 sm:px-6 py-2 bg-gray-400 text-white rounded-full text-sm sm:text-base font-semibold shadow hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors min-h-[44px]"
                  aria-label="タイトルに戻る"
                >
                  タイトルに戻る
                </button>
                <button
                  onClick={handleRematch}
                  className="px-4 sm:px-8 py-2 bg-emerald-400 text-white rounded-full text-sm sm:text-lg font-semibold shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors min-h-[44px]"
                  aria-label="もう一度遊ぶ"
                >
                  もう一度遊ぶ
                </button>
          </div>
            </div>
          </div>
        )}
          </div>
          
      {/* 演出エフェクト */}
      <GameEffects
        comboVisible={comboVisible}
        comboCount={comboCount}
        scoreEffects={scoreEffects}
        fireworkVisible={fireworkVisible}
      />

      {/* ルール説明ポップアップ */}
      <RulesPopup isVisible={showRules} onClose={() => setShowRules(false)} />
          
      {/* Connect4成立時のポップアップ */}
      {connect4Visible && connect4Player && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl shadow-xl p-6 mx-4 max-w-sm text-center border-2 border-emerald-300">
            <div className="text-4xl mb-3 text-emerald-500">⭐</div>
            <div className="text-xl font-bold text-emerald-600 mb-2">Connect4!</div>
            <div className="text-base font-semibold text-gray-700 bg-white rounded-lg p-2">
              {connect4Message}
            </div>
          </div>
        </div>
      )}

      {/* BGMコントロールボタン（固定位置） */}
      <div className="fixed bottom-4 right-4 z-50">
        <BGMControlButton size="medium" className="shadow-2xl hover:shadow-3xl" />
      </div>

    </main>
  );
} 