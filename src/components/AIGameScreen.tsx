import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import ScoreGauge from '../components/ScoreGauge';
import GameGrid from '../components/GameGrid';
import { GameEffects } from '../components/GameEffects';
import RulesPopup from '../components/RulesPopup';
import { CellState, PlayerType, PlayerInfo } from '../types/game';
import { createEmptyBoard, checkForConnect4, isColumnFull, applyGravity, checkForCombos, checkWinCondition } from '../utils/gameLogic';
import { AILevel, aiMove, getAIAvatar, getAIName, getAIThinkingTime, getAllAICharacters } from '../utils/aiLogic';

interface AIGameScreenProps {
  playerName: string;
  aiLevel: AILevel;
}

export default function AIGameScreen({ playerName, aiLevel }: AIGameScreenProps) {
  const router = useRouter();
  
  // プレイヤー情報
  const [player1, setPlayer1] = useState<PlayerInfo>({
    name: playerName,
    avatar: '/assets/Avater/Avater/normal_graycat.png',
    score: 0,
    isTurn: true,
    timer: 0,
    isActive: true,
    type: 'graycat',
  });
  
  const [player2, setPlayer2] = useState<PlayerInfo>({
    name: getAIName(aiLevel),
    avatar: getAIAvatar(aiLevel),
    score: 0,
    isTurn: false,
    timer: 0,
    isActive: true,
    type: 'ai',
  });

  // ゲーム状態
  const [gameBoard, setGameBoard] = useState<CellState[][]>(createEmptyBoard());
  const [highlightedColumn, setHighlightedColumn] = useState<number | null>(null);
  const [lastMoveColumn, setLastMoveColumn] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timers, setTimers] = useState({ player1: 0, player2: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<{ result: 'win' | 'lose' | 'draw'; winner?: string } | null>(null);
  const [finalBoard, setFinalBoard] = useState<CellState[][] | null>(null);

  // AI関連の状態
  const [aiThinking, setAiThinking] = useState(false);
  const [aiThinkingText, setAiThinkingText] = useState('');

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

  // 強さ選択ポップアップの状態
  const [showStrengthPopup, setShowStrengthPopup] = useState(false);
  const [selectedStrength, setSelectedStrength] = useState<AILevel>(aiLevel);

  // ルール説明ポップアップの状態
  const [showRules, setShowRules] = useState(false);

  // タイマー: プレイヤーの番の時だけ増える
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

  // AIの思考演出
  useEffect(() => {
    if (aiThinking) {
      const thinkingTexts = [
        '考え中...',
        '計算中...',
        '分析中...',
        '戦略を練り中...',
        '最適解を探索中...',
      ];
      let textIndex = 0;
      const textInterval = setInterval(() => {
        setAiThinkingText(thinkingTexts[textIndex]);
        textIndex = (textIndex + 1) % thinkingTexts.length;
      }, 800);
      
      return () => clearInterval(textInterval);
    }
  }, [aiThinking]);

  // AIの手番処理
  useEffect(() => {
    if (player2.isTurn && !isProcessing && !gameOver) {
      handleAITurn();
    }
  }, [player2.isTurn, isProcessing, gameOver]);

  // AIの手番を処理
  const handleAITurn = async () => {
    if (isProcessing || gameOver) return;
    
    setIsProcessing(true);
    setAiThinking(true);
    
    // AIの思考時間（現在のAI強度を使用）
    const currentAILevel = player2.name === getAIName(aiLevel) ? aiLevel : selectedStrength;
    const thinkingTime = getAIThinkingTime(currentAILevel);
    await new Promise(resolve => setTimeout(resolve, thinkingTime));
    
    setAiThinking(false);
    
    // AIの手を決定（現在のAI強度を使用）
    const aiColumn = aiMove(gameBoard, currentAILevel);
    if (aiColumn !== -1) {
      await handleColumnClick(aiColumn);
    }
  };

  // セルを置く（connect4+連鎖・重力・スコア・3点先取）
  const handleColumnClick = async (columnIndex: number) => {
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
    setLastMoveColumn(columnIndex); // 最後に置いた列を記録
    setHighlightedColumn(null); // コマを置いた直後にホバー解除
    
    // セルを置く
    let newBoard = gameBoard.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === targetRow && cIdx === columnIndex) {
          return { state: 'normal', player: playerType } as CellState;
        }
        // cellの型が不正な場合はemptyに矯正
        if (
          cell.state !== 'empty' &&
          cell.state !== 'normal' &&
          cell.state !== 'drop' &&
          cell.state !== 'star'
        ) {
          return { state: 'empty' } as CellState;
        }
        // playerの型が不正な場合はemptyに矯正
        if (
          'player' in cell &&
          typeof cell.player === 'string' &&
          cell.player !== 'player1' &&
          cell.player !== 'player2' &&
          cell.player !== 'ai'
        ) {
          return { state: 'empty' } as CellState;
        }
        return cell as CellState;
      })
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
          
          // Connect4表示を2秒間表示（見やすくするため）
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
        setTimeout(() => setComboVisible(false), 2000); // 1200ms → 2000ms
      }
      // ここで勝利判定
      if (checkWinCondition(tempPlayer1Score)) {
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
      if (checkWinCondition(tempPlayer2Score)) {
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
      // 3. 星セルを一定時間後に消去（持続時間を延長）
      await new Promise(res => setTimeout(res, 1500)); // 700ms → 1500ms
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
    if (comboWin) return;
    
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
    const p1Win = checkWinCondition(player1.score + localScore1);
    const p2Win = checkWinCondition(player2.score + localScore2);
    if (p1Win || p2Win) {
      setGameOver(true);
      setResult({ result: 'win', winner: p1Win ? player1.name : player2.name });
      setFinalBoard(newBoard);
      // 勝利時の花火エフェクト
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
  };

  // ハイライト（プレイヤーの番の時のみ）
  const handleColumnHover = (col: number) => { 
    if (!isProcessing && !gameOver && player1.isTurn) setHighlightedColumn(col); 
  };
  const handleColumnLeave = () => { setHighlightedColumn(null); };

  // タイマー表示
  const formatTime = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  // 再戦ボタン押下時
  const handleRematch = () => {
    router.push('/');
  };

  // 強さ選択ポップアップでゲーム開始
  const handleStartWithNewStrength = () => {
    const newPlayer2 = {
      ...player2,
      name: getAIName(selectedStrength),
      avatar: getAIAvatar(selectedStrength),
    };
    setPlayer2(newPlayer2);
    setShowStrengthPopup(false);
    
    // ゲームをリセット
    setGameBoard(createEmptyBoard());
    setTimers({ player1: 0, player2: 0 });
    setGameOver(false);
    setResult(null);
    setFinalBoard(null);
    setComboVisible(false);
    setComboCount(0);
    setScoreEffects([]);
    setFireworkVisible(false);
    setLastMoveColumn(null);
    setConnect4Visible(false);
    setConnect4Player(null);
    setConnect4Message('');
    setPlayer1(prev => ({ ...prev, isTurn: true, score: 0 }));
    setPlayer2(prev => ({ ...prev, isTurn: false, score: 0 }));
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
          {/* Player1 (プレイヤー) */}
          <div className={`flex flex-col items-center transition-all duration-300 ${player1.isTurn ? 'ring-2 ring-emerald-400 shadow bg-white' : 'bg-white/60'} rounded-xl px-2 py-1 sm:px-3 sm:py-2`}> 
            <img src={player1.avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow border border-emerald-200" />
            <div className="text-base sm:text-lg font-bold mt-1 text-gray-800 flex items-center gap-1">
              <span className="truncate" title={player1.name}>{player1.name}</span>
              <span className="inline-block w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" style={{ background: '#4D6869' }} title="あなたのコマ色" />
            </div>
            <div className="text-gray-500 text-xs sm:text-base font-mono tracking-wider">{formatTime(timers.player1)}</div>
            <div className="w-16 sm:w-20 mt-1"><ScoreGauge score={player1.score} maxScore={3} playerType={player1.type} /></div>
          </div>
          
          {/* VS */}
          <div className="text-lg sm:text-2xl font-extrabold text-gray-400 mb-6 select-none">VS</div>
          
          {/* Player2 (AI) */}
          <div className={`flex flex-col items-center transition-all duration-300 ${player2.isTurn ? 'ring-2 ring-emerald-400 shadow bg-white' : 'bg-white/60'} rounded-xl px-2 py-1 sm:px-3 sm:py-2 relative`}>
            <img src={player2.avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow border border-emerald-200" />
            <div className="text-base sm:text-lg font-bold mt-1 text-gray-800 flex items-center gap-1">
              <span className="truncate" title={player2.name}>{player2.name}</span>
              <span className="inline-block w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" style={{ background: '#55B89C' }} title="AIのコマ色" />
            </div>
            <div className="text-gray-500 text-xs sm:text-base font-mono tracking-wider">{formatTime(timers.player2)}</div>
            <div className="w-16 sm:w-20 mt-1"><ScoreGauge score={player2.score} maxScore={3} playerType={player2.type} /></div>
            {/* AI思考中ポップアップ */}
            {aiThinking && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 px-4 py-2 bg-white border-2 border-emerald-300 rounded-xl shadow-lg animate-pulse flex items-center gap-2">
                <span className="text-emerald-500 text-lg">💭</span>
                <span className="text-xs font-bold text-emerald-700">考え中...</span>
              </div>
            )}
          </div>
        </div>

        {/* ゲーム盤面 */}
        <div className="flex flex-col items-center w-full">
          <div className="flex justify-center items-center relative">
            <div className="rounded-3xl shadow-2xl p-4 bg-[#D9F2E1]">
              <GameGrid
                board={gameBoard}
                highlightedColumn={highlightedColumn}
                lastMoveColumn={lastMoveColumn}
                onColumnClick={handleColumnClick}
                onColumnHover={handleColumnHover}
                onColumnLeave={handleColumnLeave}
              />
            </div>
          </div>
          
          {/* Presented by & ボタン群 */}
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
                onClick={handleRematch}
                className="px-6 py-2 bg-emerald-400 text-white rounded-full text-base font-semibold shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors min-h-[44px]"
                aria-label="タイトル画面に戻る"
              >
                タイトルに戻る
              </button>
            </div>
          </div>
        </div>
        
        {/* 結果モーダル */}
        {gameOver && result && finalBoard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center w-full max-w-xs sm:max-w-md min-h-[280px] sm:min-h-[340px]">
              {/* 勝者アバターを大きく前面に */}
              {result.result === 'win' && (
                <img
                  src={result.winner === player1.name ? player1.avatar : player2.avatar}
                  className="w-24 h-24 sm:w-40 sm:h-40 rounded-full shadow-2xl border-4 border-emerald-400 -mt-16 sm:-mt-24 mb-2 sm:mb-4 z-10"
                  style={{ objectFit: 'cover', position: 'relative', top: '-20px' }}
                  alt="Winner Avatar"
                />
              )}
              <div className="text-2xl sm:text-4xl font-extrabold text-emerald-500 mb-2 text-center">
                {result.result === 'win' ? `${result.winner} の勝ち！` : '引き分け'}
              </div>
              <div className="w-full flex justify-center mb-3 sm:mb-4">
                <div className="scale-75 sm:scale-100">
                  <GameGrid board={finalBoard} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-4 w-full">
                <button
                  onClick={() => router.push('/')}
                  className="px-4 sm:px-8 py-2 bg-gray-200 text-gray-700 rounded-full text-sm sm:text-lg font-semibold shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors min-h-[44px]"
                  aria-label="ホーム画面に戻る"
                >
                  ホームに戻る
                </button>
                <button
                  onClick={handleStartWithNewStrength}
                  className="px-4 sm:px-8 py-2 bg-emerald-400 text-white rounded-full text-sm sm:text-lg font-semibold shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors min-h-[44px]"
                  aria-label="同じAIキャラクターで再戦"
                >
                  もう一度同じ強さで再戦
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 強さ選択ポップアップ */}
        {showStrengthPopup && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col items-center w-full max-w-xs sm:max-w-md max-h-[80vh] overflow-y-auto">
              <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">AIキャラクターを選択</div>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4 w-full mb-4 sm:mb-6">
                {getAllAICharacters().map((character) => (
                  <button
                    key={character.id}
                    onClick={() => setSelectedStrength(character.id)}
                    className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${
                      selectedStrength === character.id
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                    aria-label={`${character.name}（${character.level}）を選択`}
                    aria-pressed={selectedStrength === character.id}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <img 
                        src={character.avatar} 
                        alt={character.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-semibold text-base sm:text-lg">{character.name}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            character.level === '初級' ? 'bg-green-100 text-green-700' :
                            character.level === '中級' ? 'bg-blue-100 text-blue-700' :
                            character.level === '上級' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {character.level}
                          </span>
                        </div>
                        <div className="text-xs sm:text-sm opacity-75 font-semibold">「{character.nickname}」</div>
                        <div className="text-xs opacity-75 mt-1">{character.levelDescription}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
                <button
                  onClick={() => setShowStrengthPopup(false)}
                  className="px-4 sm:px-6 py-2 bg-gray-200 text-gray-700 rounded-full text-sm sm:text-base font-semibold shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors min-h-[44px]"
                  aria-label="AIキャラクター選択をキャンセル"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleStartWithNewStrength}
                  className="px-4 sm:px-6 py-2 bg-emerald-400 text-white rounded-full text-sm sm:text-base font-semibold shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors min-h-[44px]"
                  aria-label="選択したAIキャラクターでゲーム開始"
                >
                  ゲーム開始
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ルール説明ポップアップ */}
        <RulesPopup isVisible={showRules} onClose={() => setShowRules(false)} />

        {/* Connect4成立時のポップアップ */}
        {connect4Visible && connect4Player && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm text-center border-4 border-emerald-400 animate-bounce">
              <div className="text-6xl mb-4 animate-pulse">⭐</div>
              <div className="text-2xl font-bold text-emerald-600 mb-3">Connect4!</div>
              <div className="text-lg font-semibold text-gray-800 bg-white rounded-xl p-3 shadow-inner">
                {connect4Message}
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
    </main>
  );
} 