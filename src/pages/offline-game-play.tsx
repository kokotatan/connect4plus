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
  const { switchToHomeBGM } = useBGM();
  const { colors } = useTheme();

  // URLパラメータ取得
  const { player1Name, player2Name, winScore, timeLimit } = router.query;

  // ゲーム設定
  const gameSettings: GameSettings = {
    winScore: winScore ? parseInt(winScore as string) as 1 | 3 | 5 : DEFAULT_GAME_SETTINGS.winScore,
    timeLimit: (timeLimit as 'none' | '30s' | '1m') || DEFAULT_GAME_SETTINGS.timeLimit,
  };

  // プレイヤー情報
  const [player1, setPlayer1] = useState<PlayerInfo>({
    name: (player1Name as string) || 'プレイヤー1',
    avatar: '/assets/Avater/Avater/normal_graycat.png',
    score: 0,
    isTurn: true,
    timer: 0,
    isActive: true,
    type: 'graycat',
  });
  const [player2, setPlayer2] = useState<PlayerInfo>({
    name: (player2Name as string) || 'プレイヤー2',
    avatar: '/assets/Avater/Avater/normal_tiger.png',
    score: 0,
    isTurn: false,
    timer: 0,
    isActive: true,
    type: 'tiger',
  });

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
    if (player1Name && player2Name) {
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
    } else {
      router.push('/offline-game');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player1Name, player2Name]);

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
      // 盤面が安定するまで両プレイヤーで連鎖判定
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
        const combos = [
          { type: 'player1' as PlayerType, result: checkForCombos(newBoard, 'player1') },
          { type: 'player2' as PlayerType, result: checkForCombos(newBoard, 'player2') },
        ];
        // 2. 星セル化・スコア加算
        let foundCombo = false;
        combos.forEach(({ type, result }) => {
          if (result.hasCombo) {
            foundCombo = true;
            // Connect4成立時の視覚的フィードバック
            const playerName = type === 'player1' ? player1.name : player2.name;
            setConnect4Player(type);
            setConnect4Message(`${playerName}がConnect4しました！`);
            setConnect4Visible(true);
            setTimeout(() => {
              setConnect4Visible(false);
              setConnect4Player(null);
              setConnect4Message('');
            }, 2000);
            newBoard = newBoard.map((row, rIdx) =>
              row.map((cell, cIdx) =>
                result.cellsToRemove.some(([rowIdx, colIdx]) => rowIdx === rIdx && colIdx === cIdx)
                  ? { ...cell, state: 'star', player: type }
                  : cell
              )
            );
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
        });
        // COMBO!演出を表示
        if (comboChainCount > 1 && foundCombo) {
          setComboCount(comboChainCount);
          setComboVisible(true);
          setTimeout(() => setComboVisible(false), 2000);
        }
        // ここで勝利判定
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
        if (!foundCombo) break;
        // 3. 星セルを一定時間後に消去
        await new Promise(res => setTimeout(res, 1200));
        combos.forEach(({ result }) => {
          if (result.hasCombo) {
            newBoard = newBoard.map((row, rIdx) =>
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
        await new Promise(res => setTimeout(res, 300));
        newBoard = applyGravity(newBoard);
        setGameBoard(newBoard);
        // 5. 少し待ってから次の連鎖判定
        await new Promise(res => setTimeout(res, 300));
        comboing = true;
      }
      if (comboWin) {
        setIsProcessing(false);
        return;
      }
      // 最後に置いた列の強調を少し後に消す
      setTimeout(() => setLastMoveColumn(null), 2000);
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
      if (localScore1 > 0) setPlayer1(prev => ({ ...prev, score: prev.score + localScore1 }));
      if (localScore2 > 0) setPlayer2(prev => ({ ...prev, score: prev.score + localScore2 }));
      // 3点先取勝利判定
      const p1Win = checkWinCondition(player1.score + localScore1, gameSettings.winScore);
      const p2Win = checkWinCondition(player2.score + localScore2, gameSettings.winScore);
      if (p1Win || p2Win) {
        setGameOver(true);
        setResult({ result: 'win', winner: p1Win ? player1.name : player2.name });
        setFinalBoard(newBoard);
        setFireworkVisible(true);
        setTimeout(() => setFireworkVisible(false), 3000);
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
      // ターン交代
      setPlayer1(prev => ({ ...prev, isTurn: !prev.isTurn }));
      setPlayer2(prev => ({ ...prev, isTurn: !prev.isTurn }));
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
  const handleRematch = () => {
    router.push(`/offline-game?player1Name=${encodeURIComponent(player1.name)}&player2Name=${encodeURIComponent(player2.name)}&winScore=${gameSettings.winScore}&timeLimit=${gameSettings.timeLimit}`);
  };
  // ホーム
  const handleBackToHome = () => {
    switchToHomeBGM();
    router.push('/');
  };

  // ...（JSX部分は省略）
} 