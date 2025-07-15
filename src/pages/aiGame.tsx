import React from 'react';
import { useRouter } from 'next/router';
import AIGameScreen from '../components/AIGameScreen';
import { AILevel } from '../utils/aiLogic';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '../types/game';

export default function AIGamePage() {
  const router = useRouter();
  const { playerName, aiLevel, winScore, timeLimit, soundType } = router.query;

  // ゲーム設定を構築
  const gameSettings: GameSettings = {
    winScore: winScore ? parseInt(winScore as string) as 1 | 3 | 5 : DEFAULT_GAME_SETTINGS.winScore,
    timeLimit: (timeLimit as 'none' | '30s' | '1m') || DEFAULT_GAME_SETTINGS.timeLimit,
    soundType: (soundType as 'typeA' | 'typeB') || DEFAULT_GAME_SETTINGS.soundType,
  };

  // パラメータが読み込まれるまで待機
  if (!playerName || !aiLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100 to-white flex items-center justify-center">
        <div className="text-lg font-semibold text-gray-600">読み込み中...</div>
      </div>
    );
  }

  // AIレベルが有効かチェック
  const validAILevels = Object.values(AILevel);
  if (!validAILevels.includes(aiLevel as AILevel)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600 mb-4">無効なAIレベルです</div>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-emerald-400 text-white rounded-full font-semibold hover:bg-emerald-500 transition-colors"
          >
            タイトルに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <AIGameScreen 
      playerName={playerName as string} 
      aiLevel={aiLevel as AILevel} 
      gameSettings={gameSettings}
    />
  );
} 