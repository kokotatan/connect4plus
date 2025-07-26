import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import ScoreGauge from '../components/ScoreGauge';
import GameGrid from '../components/GameGrid';
import { GameEffects } from '../components/GameEffects';
import RulesPopup from '../components/RulesPopup';
import { BGMControlButton } from '../components/BGMControlButton';
import { useBGM } from '../contexts/BGMContext';
import { useTheme } from '../contexts/ThemeContext';
import { CellState, PlayerType, PlayerInfo, GameResult } from '../types/game';
import { createEmptyBoard, checkForConnect4, isColumnFull, applyGravity, checkForCombos, checkForCombosAfterGravity, checkWinCondition } from '../utils/gameLogic';
import { AILevel, getAIName, getAICharacter, getAIThinkingTime, aiMove, getAllAICharacters } from '../utils/aiLogic';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '../types/game';
import { truncatePlayerName } from '../utils/textUtils';

interface AIGameScreenProps {
  playerName: string;
  aiLevel: AILevel;
  gameSettings?: GameSettings;
}

export default function AIGameScreen({ playerName, aiLevel, gameSettings = DEFAULT_GAME_SETTINGS }: AIGameScreenProps) {
  const router = useRouter();
  const { switchToGameBGM, switchToHomeBGM, fadeIn, fadeOut } = useBGM();
  const { colors } = useTheme();
  
  // プレイヤー情報
  const [player1, setPlayer1] = useState<PlayerInfo>({
    name: playerName,
    avatar: '/assets/Avater/Avater/normal_graycat.png',
    score: 0,
    isTurn: false,
    timer: 0,
    isActive: true,
    type: 'graycat'
  });
  
  const [player2, setPlayer2] = useState<PlayerInfo>({
    name: getAIName(aiLevel),
    avatar: getAICharacter(aiLevel)?.avatar || '/assets/Avater/Avater/normal_tiger.png',
    score: 0,
    isTurn: false,
    timer: 0,
    isActive: true,
    type: 'ai'
  });

  // ゲーム状態
  const [gameBoard, setGameBoard] = useState<CellState[][]>(createEmptyBoard());
  const [highlightedColumn, setHighlightedColumn] = useState<number | null>(null);
  const [lastMoveColumn, setLastMoveColumn] = useState<number | null>(null);
  const [lastMoveRow, setLastMoveRow] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timers, setTimers] = useState({ player1: 0, player2: 0 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [finalBoard, setFinalBoard] = useState<CellState[][] | null>(null);

  // 制限時間関連の状態
  const [timeUpPlayer, setTimeUpPlayer] = useState<'player1' | 'player2' | null>(null);
  const [showTimeUpMessage, setShowTimeUpMessage] = useState(false);
  const [timeWarning, setTimeWarning] = useState<'player1' | 'player2' | null>(null);

  // AI関連の状態
  const [aiThinking, setAiThinking] = useState(false);
  const [aiThinkingText, setAiThinkingText] = useState('');
  const [aiThinkingPhase, setAiThinkingPhase] = useState(0);
  const [showMathBackground, setShowMathBackground] = useState(false);

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

  // ゲーム開始・先手抽選の状態
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStarting, setGameStarting] = useState(false);
  const [lotteryPhase, setLotteryPhase] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showFirstTurnMessage, setShowFirstTurnMessage] = useState(false);
  
  // 先手表示オーバーレイの状態
  const [showFirstTurnOverlay, setShowFirstTurnOverlay] = useState(false);
  const [firstTurnPlayerName, setFirstTurnPlayerName] = useState('');

  // AI思考パターン定義
  const getAIThinkingPatterns = (level: AILevel) => {
    const patterns = {
      [AILevel.BEGINNER]: {
        // ぽとり和尚 - 仏教的・無念無想
        calm: [
          '無念無想...',
          'ご縁ですな...',
          'ただ落とすのみ...',
          '流れに任せ...',
          'これもまた道...',
          '写経の時間...',
          '無我の境地...',
          '禅の心で...'
        ],
        excited: [
          '筋肉が震える...',
          'バキバキだ...',
          '修行の成果...',
          '鍛えた腕前...',
          '筋肉に聞く...',
          '筋力全開...',
          'パワー注入...',
          '肉体の極み...'
        ],
        phases: [
          '情報収集開始...',
          '盤面を観察...',
          '流れを感じる...',
          '直感で判断...',
          '決定実行...'
        ]
      },
      [AILevel.INTERMEDIATE]: {
        // スジノ・カタル - 筋肉×戦略
        calm: [
          '3手先を読む...',
          '戦略を練る...',
          '分析実行中...',
          '計算中...',
          '思考中...',
          '評価中...',
          '最適解探索...',
          '戦術構築...'
        ],
        excited: [
          '筋肉に聞いた！',
          '筋繊維が震える！',
          'オレの二頭筋が！',
          'ボディビル魂！',
          'ストイックに！',
          '筋肉×思考！',
          'パワー全開！',
          '筋力で勝つ！'
        ],
        phases: [
          '情報収集開始...',
          '3手先を計算...',
          '筋肉に相談...',
          '戦略構築中...',
          '決定実行...'
        ]
      },
      [AILevel.ADVANCED]: {
        // ジラフ・ロウ - 物理・重力
        calm: [
          '重力法則を計算...',
          '崩壊パターン解析...',
          '物理法則適用...',
          '落下シミュレーション...',
          '力学計算中...',
          '空間歪曲解析...',
          '次元計算中...',
          '時空を読み解く...'
        ],
        excited: [
          '物理法則、背負ってます！',
          '重力を操る！',
          '崩壊の法則！',
          '空間を歪める！',
          '次元を超越！',
          '時空を支配！',
          '物理の極み！',
          '法則を破る！'
        ],
        phases: [
          '情報収集開始...',
          '重力法則解析...',
          '崩壊パターン計算...',
          '物理シミュレーション...',
          '決定実行...'
        ]
      },
      [AILevel.EXPERT]: {
        // 最強AI - 死神のような存在
        calm: [
          '死を司る...',
          '終焉を告げる...',
          '魂を奪う...',
          '闇に沈める...',
          '滅びを導く...',
          '運命を決する...',
          '終わりを告げる...',
          '破滅を招く...'
        ],
        excited: [
          '死の舞踏！',
          '終焉の時！',
          '魂の狩り！',
          '闇の支配！',
          '滅びの宣告！',
          '運命の裁き！',
          '終わりの始まり！',
          '破滅の序章！'
        ],
        phases: [
          '死を観察...',
          '終焉を計算...',
          '魂を収穫...',
          '闇を解き放つ...'
        ]
      }
    };
    return patterns[level] || patterns[AILevel.BEGINNER];
  };

  // ゲーム状況を判定
  const getGameSituation = () => {
    const player1Score = player1.score;
    const player2Score = player2.score;
    const totalMoves = gameBoard.flat().filter(cell => cell.state !== 'empty').length;
    
    if (player2Score > player1Score + 1) return 'advantage';
    if (player1Score > player2Score + 1) return 'disadvantage';
    if (totalMoves < 10) return 'early';
    if (totalMoves > 30) return 'late';
    return 'neutral';
  };

  // 制限時間切れ判定
  const checkTimeUp = () => {
    if (gameSettings.timeLimit === 'none' || gameOver) return;
    
    const timeLimit = gameSettings.timeLimit === '30s' ? 30 : 60;
    
    if (timers.player1 >= timeLimit && !timeUpPlayer) {
      handleTimeUp('player1');
    }
    if (timers.player2 >= timeLimit && !timeUpPlayer) {
      handleTimeUp('player2');
    }
  };

  // 時間切れ処理
  const handleTimeUp = (player: 'player1' | 'player2') => {
    setTimeUpPlayer(player);
    setShowTimeUpMessage(true);
    setGameOver(true);
    
    const winner = player === 'player1' ? player2.name : player1.name;
    const loser = player === 'player1' ? player1.name : player2.name;
    
    setResult({
      result: 'timeup',
      winner: winner,
      timeUpPlayer: player
    });
    setFinalBoard(gameBoard);
    
    // 時間切れメッセージを3秒間表示
    setTimeout(() => {
      setShowTimeUpMessage(false);
    }, 3000);
  };

  // 時間警告の管理
  const checkTimeWarning = () => {
    if (gameSettings.timeLimit === 'none' || gameOver) return;
    
    const timeLimit = gameSettings.timeLimit === '30s' ? 30 : 60;
    
    // 残り10秒以下で警告
    if (timers.player1 >= timeLimit - 10 && timers.player1 < timeLimit) {
      setTimeWarning('player1');
    } else if (timers.player2 >= timeLimit - 10 && timers.player2 < timeLimit) {
      setTimeWarning('player2');
    } else {
      setTimeWarning(null);
    }
  };

  // タイマー: プレイヤーの番の時だけ増える
  useEffect(() => {
    if (gameOver || showFirstTurnOverlay) return; // 先手表示中はタイマーを停止
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimers(prev => {
        if (player1.isTurn) return { ...prev, player1: prev.player1 + 1 };
        if (player2.isTurn) return { ...prev, player2: prev.player2 + 1 };
        return prev;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [player1.isTurn, player2.isTurn, gameOver, showFirstTurnOverlay]);

  // 制限時間チェック
  useEffect(() => {
    checkTimeUp();
    checkTimeWarning();
  }, [timers, checkTimeUp, checkTimeWarning]);

  // AIの思考演出
  useEffect(() => {
    if (aiThinking) {
      const currentAILevel = player2.name === getAIName(aiLevel) ? aiLevel : selectedStrength;
      const patterns = getAIThinkingPatterns(currentAILevel);
      const situation = getGameSituation();
      
      // 最強AIの場合は背景に数式を表示
      if (currentAILevel === AILevel.EXPERT) {
        setShowMathBackground(true);
      }
      
      // 思考時間が長いAI（上級・最強）のみ段階表示を行う
      const shouldShowPhases = currentAILevel === AILevel.ADVANCED || currentAILevel === AILevel.EXPERT;
      
      if (shouldShowPhases) {
        // 段階を進める（思考時間が長いAIのみ）
        let phaseIndex = 0;
        const phaseInterval = setInterval(() => {
          if (phaseIndex < patterns.phases.length) {
            // 「情報収集開始」は表示しない
            const phaseText = patterns.phases[phaseIndex];
            if (phaseText !== '情報収集開始...') {
              setAiThinkingText(phaseText);
              setAiThinkingPhase(phaseIndex);
            }
            phaseIndex++;
          } else {
            clearInterval(phaseInterval);
          }
        }, 2000); // 2秒間隔
        
        return () => {
          clearInterval(phaseInterval);
          setShowMathBackground(false);
        };
      } else {
        // 初級・中級AIは単語単位で自然な表示（より短い間隔）
        const words = [
          ...patterns.calm.map(msg => msg.replace('...', '')),
          ...patterns.excited.map(msg => msg.replace('...', ''))
        ];
        
        let wordIndex = 0;
        const wordInterval = setInterval(() => {
          const randomWord = words[Math.floor(Math.random() * words.length)];
          setAiThinkingText(randomWord);
          wordIndex++;
        }, 800); // 1.5秒 → 0.8秒に短縮
        
        return () => {
          clearInterval(wordInterval);
          setShowMathBackground(false);
        };
      }
    } else {
      setShowMathBackground(false);
      setAiThinkingPhase(0);
    }
  }, [aiThinking, aiLevel, selectedStrength, player2.name]);

  // AIの手番処理
  const handleAITurn = () => {
    console.log('handleAITurn実行:', { isProcessing, gameOver });
    if (isProcessing || gameOver) return;
    
    console.log('AI思考開始');
    setIsProcessing(true);
    setAiThinking(true);
    
    // AIの思考時間（現在のAI強度を使用）
    const currentAILevel = player2.name === getAIName(aiLevel) ? aiLevel : selectedStrength;
    const baseThinkingTime = getAIThinkingTime(currentAILevel);
    
    // 思考段階に応じた時間配分（上級・最強AIのみ）
    const shouldShowPhases = currentAILevel === AILevel.ADVANCED || currentAILevel === AILevel.EXPERT;
    
    if (shouldShowPhases) {
      const patterns = getAIThinkingPatterns(currentAILevel);
      const phaseCount = patterns.phases.length;
      const phaseTime = baseThinkingTime / phaseCount;
      
      // 各段階で少し待機
      for (let i = 0; i < phaseCount; i++) {
        setTimeout(() => {}, phaseTime);
      }
    } else {
      // 初級・中級AIは単純に思考時間だけ待機
      setTimeout(() => {}, baseThinkingTime);
    }
    
    setAiThinking(false);
    
    // AIの手を決定（現在のAI強度を使用）
    const aiColumn = aiMove(gameBoard, currentAILevel);
    if (aiColumn !== -1) {
      // handleColumnClickを直接呼び出し（AIの手番として明示）
      handleColumnClickDirect(aiColumn, 'ai');
    }
  };

  // 直接的なセルクリック処理（循環参照を避けるため）
  const handleColumnClickDirect = (columnIndex: number, caller?: 'ai' | 'player') => {
    if (isProcessing || gameOver) return;
    
    // 呼び出し元に基づいてプレイヤータイプを決定
    let playerType: PlayerType;
    if (caller === 'ai') {
      // AIの手番処理から呼び出された場合は確実にplayer2
      playerType = 'player2';
    } else {
      // プレイヤーのクリックから呼び出された場合はplayer1
      playerType = 'player1';
    }
    
    console.log('=== handleColumnClickDirect実行 ===');
    console.log('入力パラメータ:', {
      columnIndex,
      caller,
      player1Turn: player1.isTurn,
      player2Turn: player2.isTurn,
      playerType,
      isProcessing,
      gameOver
    });
    console.log('AI判定:', {
      isAITurn: player2.isTurn,
      isPlayerTurn: player1.isTurn,
      player2Type: player2.type,
      player2Name: player2.name
    });
    console.log('コマ配置:', {
      placingAs: playerType,
      expectedColor: playerType === 'player1' ? 'player1Color' : 'player2Color'
    });
    
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
    setLastMoveRow(targetRow); // 最後に置いた行を記録
    setHighlightedColumn(null); // コマを置いた直後にホバー解除
    
    // セルを置く
    let newBoard = gameBoard.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === targetRow && cIdx === columnIndex) {
          console.log(`コマ配置実行: [${rIdx}, ${cIdx}] = ${playerType} (呼び出し元: ${caller})`);
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
    let player1ComboCount = 0; // プレイヤー1のCOMBO回数
    let player2ComboCount = 0; // プレイヤー2のCOMBO回数
    let tempPlayer1Score = player1.score;
    let tempPlayer2Score = player2.score;
    let comboWin = false;
    while (comboing) {
      comboing = false;
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
        
        // COMBO回数をカウント
        if (type === 'player1') {
          player1ComboCount++;
        } else {
          player2ComboCount++;
        }
        
        // Connect4成立時の視覚的フィードバック
        setConnect4Player(type === 'player1' ? 'player1' : 'player2');
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
      
      // 相手プレイヤーのconnect4を処理（現在のターンプレイヤーの処理が終わった後）
      if (opponentPlayerCombo) {
        foundCombo = true;
        const { type, result } = opponentPlayerCombo;
        const playerName = type === 'player1' ? player1.name : player2.name;
        
        // COMBO回数をカウント
        if (type === 'player1') {
          player1ComboCount++;
        } else {
          player2ComboCount++;
        }
        
        // Connect4成立時の視覚的フィードバック
        setConnect4Player(type === 'player1' ? 'player1' : 'player2');
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
      
      // COMBO!演出を表示（プレイヤーごとに独立して表示）
      if (player1ComboCount > 1) {
        setComboCount(player1ComboCount);
        setComboVisible(true);
        setTimeout(() => setComboVisible(false), 2000);
      } else if (player2ComboCount > 1) {
        setComboCount(player2ComboCount);
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
        setLastMoveColumn(null);
        setLastMoveRow(null);
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
        setLastMoveColumn(null);
        setLastMoveRow(null);
        setFireworkVisible(true);
        setTimeout(() => setFireworkVisible(false), 3000);
        comboWin = true;
        break;
      }
      if (!foundCombo) break;
      // 3. 星セルを一定時間後に消去（両プレイヤーのconnect4処理が終わった後）
      setTimeout(() => {}, 1200); // 1500ms → 1200ms
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
      setTimeout(() => {}, 300);
      newBoard = applyGravity(newBoard);
      setGameBoard(newBoard);
      // 5. 少し待ってから次の連鎖判定
      setTimeout(() => {}, 300);
      
      // 重力適用後のConnect4判定（下から順に処理）
      const player1ComboAfterGravity = checkForCombosAfterGravity(newBoard, 'player1');
      const player2ComboAfterGravity = checkForCombosAfterGravity(newBoard, 'player2');
      
      // 重力適用後に新たなConnect4がある場合は連鎖を継続
      if (player1ComboAfterGravity.hasCombo || player2ComboAfterGravity.hasCombo) {
        comboing = true;
      }
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
    const p1Win = checkWinCondition(player1.score + localScore1, gameSettings.winScore);
    const p2Win = checkWinCondition(player2.score + localScore2, gameSettings.winScore);
    if (p1Win || p2Win) {
      setGameOver(true);
      setResult({ result: 'win', winner: p1Win ? player1.name : player2.name });
      setFinalBoard(newBoard);
      setLastMoveColumn(null);
      setLastMoveRow(null);
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
      setLastMoveColumn(null);
      setLastMoveRow(null);
      setIsProcessing(false);
      return;
    }
    
    // ターン交代
    setPlayer1(prev => ({ ...prev, isTurn: !prev.isTurn }));
    setPlayer2(prev => ({ ...prev, isTurn: !prev.isTurn }));
    
    // ターン交代の確認ログ
    console.log('ターン交代完了:', {
      newPlayer1Turn: !player1.isTurn,
      newPlayer2Turn: !player2.isTurn,
      player2Type: player2.type
    });
    
    // ターン交代後に少し遅延を入れてから処理完了
    setTimeout(() => {
      setIsProcessing(false);
    }, 500); // 0.5秒の遅延を追加
  };

  // AIの手番を監視
  useEffect(() => {
    const shouldAIMove = gameStarted && 
      !isProcessing && 
      !gameOver && 
      player2.isTurn && 
      player2.type === 'ai' &&
      !showFirstTurnMessage &&
      !showFirstTurnOverlay;
    
    console.log('AI手番判定:', {
      shouldAIMove,
      gameStarted,
      isProcessing,
      gameOver,
      player2Turn: player2.isTurn,
      player2Type: player2.type,
      showFirstTurnMessage,
      showFirstTurnOverlay,
      reason: !gameStarted ? 'ゲーム未開始' :
         isProcessing ? '処理中' :
         gameOver ? 'ゲーム終了' :
         !player2.isTurn ? 'AIの番ではない' :
         player2.type !== 'ai' ? 'AIプレイヤーではない' :
         showFirstTurnMessage ? '初回メッセージ表示中' :
         showFirstTurnOverlay ? '先手表示オーバーレイ表示中' : 'その他'
    });
    
    if (shouldAIMove) {
      const delay = 1500; // 1秒 → 1.5秒に延長
      console.log(`AI手番開始: ${delay}ms後に実行`);
      setTimeout(() => {
        handleAITurn();
      }, delay);
    }
  }, [player2.isTurn, player1.isTurn, isProcessing, gameOver, gameStarted, showFirstTurnMessage, showFirstTurnOverlay, handleAITurn]); // player2.typeを依存配列から削除

  // セルを置く（connect4+連鎖・重力・スコア・3点先取）
  const handleColumnClick = (columnIndex: number) => {
    // プレイヤーの手番のみ処理（先手表示オーバーレイ中は除外）
    if (player1.isTurn && !showFirstTurnOverlay) {
      handleColumnClickDirect(columnIndex, 'player');
    }
  };

  // ハイライト（プレイヤーの番の時のみ、先手表示オーバーレイ中は除外）
  const handleColumnHover = (col: number) => { 
    if (!isProcessing && !gameOver && player1.isTurn && !showFirstTurnOverlay) setHighlightedColumn(col); 
  };
  const handleColumnLeave = () => { setHighlightedColumn(null); };

  // タイマー表示
  const formatTime = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  // 制限時間表示
  const getTimeLimitDisplay = () => {
    if (gameSettings.timeLimit === 'none') return null;
    return gameSettings.timeLimit === '30s' ? '00:30' : '01:00';
  };

  // タイマーの警告クラス
  const getTimerWarningClass = (player: 'player1' | 'player2') => {
    if (gameSettings.timeLimit === 'none') return '';
    if (timeWarning === player) return 'text-red-500 animate-pulse';
    if (timeUpPlayer === player) return 'text-red-600 font-bold';
    return '';
  };

  // 再戦ボタン押下時
  const handleRematch = () => {
    // タイトルに戻る時はホームBGMに切り替え
    switchToHomeBGM();
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  // 強さ選択ポップアップでゲーム開始
  const handleStartWithNewStrength = () => {
    const newPlayer2 = {
      ...player2,
      name: getAIName(selectedStrength),
      avatar: getAICharacter(selectedStrength)?.avatar || '/assets/Avater/Avater/normal_tiger.png',
    };
    setPlayer2(newPlayer2);
    setShowStrengthPopup(false);
    
    // ゲームをリセット（ターン設定はhandleStartGameで行うため除外）
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
    setLastMoveRow(null);
    setConnect4Visible(false);
    setConnect4Player(null);
    setConnect4Message('');
    // ターン設定はhandleStartGameで行うため削除
    // setPlayer1(prev => ({ ...prev, isTurn: true, score: 0 }));
    // setPlayer2(prev => ({ ...prev, isTurn: false, score: 0 }));
    setPlayer1(prev => ({ ...prev, score: 0 }));
    setPlayer2(prev => ({ ...prev, score: 0 }));
    setGameStarted(false);
    setGameStarting(false);
    setLotteryPhase(false);
    setSelectedPlayer(null);
    setShowFirstTurnMessage(false);
    setShowFirstTurnOverlay(false);
    setFirstTurnPlayerName('');
    setAiThinking(false);
    setAiThinkingText('');
    setAiThinkingPhase(0);
    setShowMathBackground(false);
    
    // 制限時間関連の状態をリセット
    setTimeUpPlayer(null);
    setShowTimeUpMessage(false);
    setTimeWarning(null);
    
    // 新しいゲームを開始（少し遅延を入れて状態リセットを確実にする）
    setTimeout(() => {
      handleStartGame();
    }, 200);
  };

  // タイトルに戻るボタン押下時
  const handleGoHome = () => {
    // ホームBGMに切り替えてから遷移
    switchToHomeBGM();
    // BGMをフェードアウトしてから遷移
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  // 対戦相手を変えるボタン押下時
  const handleChangeOpponent = () => {
    // ホームBGMに切り替えてから遷移
    switchToHomeBGM();
    setTimeout(() => {
      router.push(`/?playerName=${encodeURIComponent(playerName)}&scrollToAI=true&winScore=${gameSettings.winScore}&timeLimit=${gameSettings.timeLimit}`);
    }, 500);
  };

  // ゲーム開始ボタン押下時
  const handleStartGame = () => {
    setGameStarting(true);
    
    // ゲームスタート前にフェードアウト
    fadeOut(1000); // 1秒でフェードアウト
    
    setTimeout(() => {
      setLotteryPhase(true);
      const randomValue = Math.random(); // 一度だけ生成
      const firstTurn = randomValue < 0.5 ? 'player1' : 'player2';
      setSelectedPlayer(firstTurn);
      
      console.log('先手抽選結果:', {
        randomValue, // 同じ値を使用
        firstTurn,
        player1Name: player1.name,
        player2Name: player2.name
      });
      
      // 4秒後にゲーム開始
      setTimeout(() => {
        setGameStarted(true);
        
        // ターン設定を確実に同期
        const player1Turn = firstTurn === 'player1';
        const player2Turn = firstTurn === 'player2';
        
        console.log('ゲーム開始時のターン設定:', {
          firstTurn,
          player1Turn,
          player2Turn,
          player2Type: player2.type
        });
        
        setPlayer1(prev => ({ ...prev, isTurn: player1Turn }));
        setPlayer2(prev => ({ ...prev, isTurn: player2Turn }));
        setLastMoveColumn(null);
        setLastMoveRow(null);
        
        console.log('ターン設定完了:', {
          player1Turn,
          player2Turn,
          player1Name: player1.name,
          player2Name: player2.name,
          player2Type: player2.type
        });
        
        // 先手表示オーバーレイを表示
        const firstTurnName = firstTurn === 'player1' ? player1.name : player2.name;
        setFirstTurnPlayerName(firstTurnName);
        setShowFirstTurnOverlay(true);
        
        // 1.7秒後に先手表示を消してゲーム開始
        setTimeout(() => {
          setShowFirstTurnOverlay(false);
          
          // AIが先手の場合は少し遅延を入れてからAI手番を開始
          if (player2Turn) {
            setTimeout(() => {
              console.log('AI先手: 手番開始');
            }, 500);
          }
        }, 1700);
        
        // フェードインで再生開始
        setTimeout(() => {
          fadeIn(2000); // 2秒でフェードイン
        }, 100);
        
        // AI先手メッセージ表示処理を削除
      }, 2500); // 1500ms + 2500ms = 4000ms
    }, 1500);
  };

  // BGM制御
  // ゲーム開始時に必ずゲームBGMを流す
  useEffect(() => {
    if (gameStarted) {
      console.log('ゲーム開始時のBGM切り替え');
      switchToGameBGM();
      setTimeout(() => {
        fadeIn(2000);
      }, 100);
    }
  }, [gameStarted]); // fadeInとswitchToGameBGMを依存配列から除外

  // ゲーム開始前の画面
  if (!gameStarted) {
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
            <div className="flex flex-col items-center bg-white/60 rounded-xl px-2 py-1 sm:px-3 sm:py-2"> 
              <img src={player1.avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow border border-emerald-200" />
              <div className="text-base sm:text-lg font-bold mt-1 text-gray-800 flex items-center gap-1">
                <span className="truncate" title={player1.name}>{player1.name}</span>
                <span className="inline-block w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" style={{ background: colors.player1Color }} title="あなたのコマ色" />
              </div>
            </div>
            
            {/* VS */}
            <div className="text-lg sm:text-2xl font-extrabold text-gray-400 mb-6 select-none">VS</div>
            
            {/* Player2 (AI) */}
            <div className="flex flex-col items-center bg-white/60 rounded-xl px-2 py-1 sm:px-3 sm:py-2">
              <img src={player2.avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow border border-emerald-200" />
              <div className="text-base sm:text-lg font-bold mt-1 text-gray-800 flex items-center gap-1">
                <span className="truncate" title={player2.name}>{player2.name}</span>
                <span className="inline-block w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" style={{ background: colors.player2Color }} title="AIのコマ色" />
              </div>
            </div>
          </div>

          {/* ゲーム開始画面 */}
          {!gameStarting ? (
            <div className="flex flex-col items-center w-full">
              <div className="bg-white rounded-2xl shadow-lg w-full max-w-xs sm:w-80 flex flex-col items-center px-6 py-6 mb-4">
                <div className="text-lg font-bold text-gray-800 mb-4 text-center">AI戦の準備ができました</div>
                <button
                  onClick={handleStartGame}
                  className="w-full h-12 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-lg font-extrabold tracking-wide rounded-xl shadow hover:scale-105 active:scale-95 hover:from-purple-500 hover:to-pink-500 transition-all duration-150 drop-shadow-md"
                >
                  ゲーム開始
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="text-center w-full max-w-xs sm:max-w-md mx-auto flex flex-col items-center">
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
                    <div className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-base sm:text-lg font-bold transition-all duration-500 ${lotteryPhase && selectedPlayer === 'player1' ? 'scale-110 shadow-lg' : 'bg-gray-200 text-gray-600'}`} style={lotteryPhase && selectedPlayer === 'player1' ? { backgroundColor: colors.player1Color, color: 'white' } : {}} title={player1.name}>{truncatePlayerName(player1.name)}</div>
                    <div className="text-lg sm:text-2xl font-bold text-gray-400">VS</div>
                    <div className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-base sm:text-lg font-bold transition-all duration-500 ${lotteryPhase && selectedPlayer === 'player2' ? 'scale-110 shadow-lg' : 'bg-gray-200 text-gray-600'}`} style={lotteryPhase && selectedPlayer === 'player2' ? { backgroundColor: colors.player2Color, color: 'white' } : {}} title={player2.name}>{truncatePlayerName(player2.name)}</div>
                  </div>
                  <div className={`w-10 h-10 sm:w-16 sm:h-16 border-4 border-emerald-400 border-t-transparent rounded-full mx-auto ${lotteryPhase ? 'animate-pulse' : 'animate-spin'}`}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 背景BGM */}
        {/* BackgroundMusic ref={bgmRef} isPlaying={true} volume={0.2} showControls={gameStarted} /> */}
        
        {/* BGMコントロールボタン（固定位置） */}
        <div className="fixed bottom-4 right-4 z-50">
          <BGMControlButton size="medium" className="shadow-2xl hover:shadow-3xl" />
        </div>
      </main>
    );
  }

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
              <span className="truncate" title={player1.name}>{truncatePlayerName(player1.name)}</span>
              <span className="inline-block w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" style={{ background: colors.player1Color }} title="あなたのコマ色" />
            </div>
            <div className={`text-xs sm:text-base font-mono tracking-wider ${getTimerWarningClass('player1')}`}>
              {formatTime(timers.player1)}
              {getTimeLimitDisplay() && (
                <span className="text-gray-400 ml-1">/ {getTimeLimitDisplay()}</span>
              )}
            </div>
            <div className="w-full mt-1 flex justify-center"><ScoreGauge score={player1.score} maxScore={gameSettings.winScore} playerType={player1.type} /></div>
          </div>
          
          {/* VS */}
          <div className="text-lg sm:text-2xl font-extrabold text-gray-400 mb-6 select-none">VS</div>
          
          {/* Player2 (AI) */}
          <div className={`flex flex-col items-center transition-all duration-300 ${player2.isTurn ? 'ring-2 ring-emerald-400 shadow bg-white' : 'bg-white/60'} rounded-xl px-2 py-1 sm:px-3 sm:py-2 relative`}>
            <img src={player2.avatar} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white shadow border border-emerald-200" />
            <div className="text-base sm:text-lg font-bold mt-1 text-gray-800 flex items-center gap-1">
              <span className="truncate" title={player2.name}>{truncatePlayerName(player2.name)}</span>
              <span className="inline-block w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" style={{ background: colors.player2Color }} title="AIのコマ色" />
            </div>
            <div className={`text-xs sm:text-base font-mono tracking-wider ${getTimerWarningClass('player2')}`}>
              {formatTime(timers.player2)}
              {getTimeLimitDisplay() && (
                <span className="text-gray-400 ml-1">/ {getTimeLimitDisplay()}</span>
              )}
            </div>
            <div className="w-full mt-1 flex justify-center"><ScoreGauge score={player2.score} maxScore={gameSettings.winScore} playerType={player2.type} /></div>
            {/* AI思考中ポップアップ */}
            {aiThinking && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 px-4 py-2 bg-white border-2 border-emerald-300 rounded-xl shadow-lg animate-pulse flex items-center gap-2">
                <span className="text-emerald-500 text-lg">💭</span>
                <span className="text-xs font-bold text-emerald-700">{aiThinkingText}</span>
              </div>
            )}
          </div>
        </div>

        {/* ゲーム盤面 */}
        <div className="flex flex-col items-center w-full">
          {/* AI先手メッセージを削除 */}
          
          <div className="flex justify-center items-center relative">
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
            <div className="text-sm text-gray-500 font-semibold mb-4">
              © 2025 Kotaro Design Lab. All rights reserved.
            </div>
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

        {/* 最強AI用数式背景 */}
        {showMathBackground && (
          <div className="fixed inset-0 pointer-events-none z-30">
            {/* 暗いオーバーレイ */}
            <div className="absolute inset-0 bg-black/15"></div>
            
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className="absolute text-purple-400/60 text-sm font-mono animate-pulse font-bold"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${4 + Math.random() * 3}s`,
                    fontSize: `${14 + Math.random() * 10}px`,
                    textShadow: '0 0 12px rgba(147, 51, 234, 0.8), 0 0 20px rgba(147, 51, 234, 0.4)',
                    filter: 'drop-shadow(0 0 4px rgba(147, 51, 234, 0.6))'
                  }}
                >
                  {[
                    '∫(x²)dx',
                    '∑(n=1→∞)',
                    '∇²ψ = 0',
                    'E = mc²',
                    'F = ma',
                    'πr²',
                    '√(-1)',
                    'lim(x→∞)',
                    '∂f/∂x',
                    '∮F·dr',
                    'det(A)',
                    'tr(M)',
                    'dim(V)',
                    'ker(T)',
                    'im(f)',
                    'gcd(a,b)',
                    'lcm(x,y)',
                    'φ(n)',
                    'ζ(s)',
                    'Γ(z)',
                    '∀x∈ℝ',
                    '∃y∈ℂ',
                    'P(A|B)',
                    'H(p)',
                    'I(X;Y)'
                  ][i % 25]}
                </div>
              ))}
            </div>
          </div>
        )}
        
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
                {result.result === 'win' ? `${result.winner}の勝ち！` : 
                 result.result === 'timeup' ? `${result.winner}の勝ち！（時間切れ）` : 
                 '引き分け'}
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
                  aria-label="ホーム画面に戻る"
                >
                  ホームに戻る
                </button>
                <button
                  onClick={handleChangeOpponent}
                  className="px-4 sm:px-6 py-2 bg-purple-400 text-white rounded-full text-sm sm:text-base font-semibold shadow hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors min-h-[44px]"
                  aria-label="対戦相手を変える"
                >
                  対戦相手を変える
                </button>
                <button
                  onClick={handleStartWithNewStrength}
                  className="px-4 sm:px-6 py-2 bg-emerald-400 text-white rounded-full text-sm sm:text-base font-semibold shadow hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors min-h-[44px]"
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

        {/* 時間切れメッセージポップアップ */}
        {showTimeUpMessage && timeUpPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl shadow-xl p-6 mx-4 max-w-sm text-center border-2 border-red-300">
              <div className="text-4xl mb-3 text-red-500">⏰</div>
              <div className="text-xl font-bold text-red-600 mb-2">時間切れ！</div>
              <div className="text-base font-semibold text-gray-700 bg-white rounded-lg p-2">
                {timeUpPlayer === 'player1' ? player1.name : player2.name}の時間が切れました
              </div>
              <div className="text-lg font-bold text-emerald-600 mt-2">
                {timeUpPlayer === 'player1' ? player2.name : player1.name}の勝利！
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
      
      {/* BGMコントロールボタン（固定位置） */}
      <div className="fixed bottom-4 right-4 z-50">
        <BGMControlButton size="medium" className="shadow-2xl hover:shadow-3xl" />
      </div>
    </main>
  );
} 