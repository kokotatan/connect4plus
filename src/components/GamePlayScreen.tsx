import React, { useState, useEffect, useRef } from 'react';
import ScoreGauge from '../components/ScoreGauge';
import Cell from '../components/Cell';
import GameGrid from '../components/GameGrid';
import { CellState, PlayerType, PlayerInfo } from '../types/game';
import { createEmptyBoard, checkForConnect4, isColumnFull } from '../utils/gameLogic';

interface GamePlayScreenProps {
  player1: PlayerInfo;
  player2: PlayerInfo;
  onGameEnd?: (winner: string | null) => void;
}

const AVATERS = {
  player1: '/assets/Avater/Avater/normal_graycat.png',
  player2: '/assets/Avater/Avater/normal_tiger.png',
};

export default function GamePlayScreen({ player1: initialPlayer1, player2: initialPlayer2, onGameEnd }: GamePlayScreenProps) {
  const [player1, setPlayer1] = useState<PlayerInfo>({ ...initialPlayer1, avatar: AVATERS.player1 });
  const [player2, setPlayer2] = useState<PlayerInfo>({ ...initialPlayer2, avatar: AVATERS.player2 });
  const [gameBoard, setGameBoard] = useState<CellState[][]>(createEmptyBoard());
  const [highlightedColumn, setHighlightedColumn] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timers, setTimers] = useState({ player1: 0, player2: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [gameOver, setGameOver] = useState(false);

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

  // セルを置く（connect4標準）
  const handleColumnClick = (columnIndex: number) => {
    if (isProcessing || gameOver) return;
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
    // セルを置く
    const newBoard = gameBoard.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === targetRow && cIdx === columnIndex ? { state: 'normal', player: playerType } : cell))
    );
    setGameBoard(newBoard);
    // 勝敗判定
    const result = checkForConnect4(newBoard, columnIndex, targetRow, playerType);
    if (result.hasConnect4) {
      setGameOver(true);
      onGameEnd?.(playerType === 'player1' ? player1.name : player2.name);
      setIsProcessing(false);
      return;
    }
    // 引き分け判定
    if (newBoard.every(row => row.every(cell => cell.state !== 'empty'))) {
      setGameOver(true);
      onGameEnd?.(null);
      setIsProcessing(false);
      return;
    }
    // ターン交代
    setPlayer1(prev => ({ ...prev, isTurn: !prev.isTurn }));
    setPlayer2(prev => ({ ...prev, isTurn: !prev.isTurn }));
    setIsProcessing(false);
  };

  // ハイライト
  const handleColumnHover = (col: number) => { if (!isProcessing && !gameOver) setHighlightedColumn(col); };
  const handleColumnLeave = () => { setHighlightedColumn(null); };

  // タイマー表示
  const formatTime = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  // UI
  return (
    <main className="w-full min-h-screen flex flex-col items-center bg-stone-50">
      {/* タイトル */}
      <div className="w-full flex flex-col items-center mt-8 mb-2">
        <div className="text-3xl font-bold text-black">connect4plus</div>
        <div className="text-xs text-gray-500 mt-1">次世代方立体四目並べ</div>
      </div>
      {/* プレイヤー情報 */}
      <div className="w-full flex flex-row justify-center items-end gap-16 mb-4">
        {/* Player1 */}
        <div className="flex flex-col items-center">
          <img src={AVATERS.player1} alt="Player 1 Avatar" className="w-16 h-16 rounded-full border-2 border-emerald-300 bg-white" />
          <div className="text-lg font-semibold mt-1">{player1.name}</div>
          <div className="text-gray-600 text-sm">{formatTime(timers.player1)}</div>
          <div className="w-20 mt-1">{<ScoreGauge score={player1.score} maxScore={3} playerType="player1" />}</div>
        </div>
        {/* Player2 */}
        <div className="flex flex-col items-center">
          <img src={AVATERS.player2} alt="Player 2 Avatar" className="w-16 h-16 rounded-full border-2 border-emerald-300 bg-white" />
          <div className="text-lg font-semibold mt-1">{player2.name}</div>
          <div className="text-gray-600 text-sm">{formatTime(timers.player2)}</div>
          <div className="w-20 mt-1">{<ScoreGauge score={player2.score} maxScore={3} playerType="player2" />}</div>
        </div>
      </div>
      {/* ゲームボード */}
      <div className="flex justify-center items-center mt-2 mb-8">
        <GameGrid
          board={gameBoard}
          highlightedColumn={highlightedColumn}
          onColumnClick={handleColumnClick}
          onColumnHover={handleColumnHover}
          onColumnLeave={handleColumnLeave}
        />
      </div>
      {/* Presented by */}
      <div className="w-full flex justify-center mt-4 mb-2">
        <div className="text-sm text-gray-500 font-semibold">Presented by Kotaro Design Lab.</div>
      </div>
    </main>
  );
} 