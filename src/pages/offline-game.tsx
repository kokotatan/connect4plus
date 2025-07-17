import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { BGMControlButton } from '../components/BGMControlButton';
import { useBGM } from '../contexts/BGMContext';
import { GameSettings, DEFAULT_GAME_SETTINGS } from '../types/game';
import GameSettingsPanel from '../components/GameSettingsPanel';

export default function OfflineGamePage() {
  const router = useRouter();
  const { switchToGameBGM } = useBGM();
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [gameSettings, setGameSettings] = useState<GameSettings>(DEFAULT_GAME_SETTINGS);

  // URLパラメータから名前を読み込み
  useEffect(() => {
    if (router.isReady) {
      const { player1Name: urlPlayer1Name, player2Name: urlPlayer2Name, winScore, timeLimit } = router.query;
      
      if (urlPlayer1Name && typeof urlPlayer1Name === 'string') {
        setPlayer1Name(urlPlayer1Name);
      }
      
      if (urlPlayer2Name && typeof urlPlayer2Name === 'string') {
        setPlayer2Name(urlPlayer2Name);
      }
      
      if (winScore && typeof winScore === 'string') {
        setGameSettings(prev => ({ ...prev, winScore: parseInt(winScore) }));
      }
      
      if (timeLimit && typeof timeLimit === 'string') {
        setGameSettings(prev => ({ ...prev, timeLimit: parseInt(timeLimit) }));
      }
    }
  }, [router.isReady, router.query]);

  const handleStartGame = () => {
    if (player1Name.trim() && player2Name.trim()) {
      // ゲームBGMに切り替え
      switchToGameBGM();
      
      // オフラインゲーム画面に遷移
      router.push(`/offline-game-play?player1Name=${encodeURIComponent(player1Name.trim())}&player2Name=${encodeURIComponent(player2Name.trim())}&winScore=${gameSettings.winScore}&timeLimit=${gameSettings.timeLimit}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100 to-white flex flex-col justify-center items-center font-noto py-6 px-2">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="mb-2">
          <h1 className="text-4xl font-extrabold text-black text-center tracking-tight drop-shadow-sm">connect4plus</h1>
          <p className="text-lg text-gray-500 font-semibold text-center mt-1">オフライン対戦</p>
        </div>

        {/* プレイヤー名入力カード */}
        <div className="bg-gradient-to-br from-white via-orange-50 to-orange-100 rounded-3xl shadow-xl py-10 px-7 w-full flex flex-col items-center gap-6">
          <p className="text-lg text-black font-bold text-center">プレイヤー名を入力してください</p>
          
          {/* プレイヤー1 */}
          <div className="w-full flex flex-col items-center gap-2">
            <label className="block w-full text-lg font-bold text-gray-800 text-center mb-1">プレイヤー1</label>
            <div className="flex w-full justify-center items-end mb-2">
              <img src="/assets/Avater/PosingAvater/graycat_muscle.png" alt="Player 1" className="w-28 h-32 object-contain" />
            </div>
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="プレイヤー1の名前"
              className="w-full max-w-xs h-12 bg-gray-50 rounded-xl border-2 border-gray-200 px-4 text-lg font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition placeholder-gray-400 mb-2"
            />
          </div>

          {/* プレイヤー2 */}
          <div className="w-full flex flex-col items-center gap-2">
            <label className="block w-full text-lg font-bold text-gray-800 text-center mb-1">プレイヤー2</label>
            <div className="flex w-full justify-center items-end mb-2">
              <img src="/assets/Avater/PosingAvater/tiger_muscle.png" alt="Player 2" className="w-28 h-32 object-contain" />
            </div>
            <input
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              placeholder="プレイヤー2の名前"
              className="w-full max-w-xs h-12 bg-gray-50 rounded-xl border-2 border-gray-200 px-4 text-lg font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition placeholder-gray-400 mb-2"
            />
          </div>

          {/* ゲーム設定パネル */}
          <GameSettingsPanel
            settings={gameSettings}
            onSettingsChange={setGameSettings}
            isVisible={true}
          />

          {/* 開始ボタン */}
          <button
            onClick={handleStartGame}
            disabled={!player1Name.trim() || !player2Name.trim()}
            className="w-full max-w-xs h-12 bg-gradient-to-r from-orange-400 to-red-400 text-white text-lg font-extrabold tracking-wide rounded-xl shadow hover:scale-105 active:scale-95 hover:from-orange-500 hover:to-red-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-md"
          >
            ゲーム開始
          </button>

          {/* 戻るボタン */}
          <button
            onClick={() => router.push('/')}
            className="w-full max-w-xs h-10 bg-gray-400 text-white text-base font-semibold rounded-xl shadow hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
      
      {/* 固定BGMコントロールボタン */}
      <div className="fixed bottom-4 right-4 z-50">
        <BGMControlButton size="medium" className="shadow-2xl hover:shadow-3xl" />
      </div>
    </div>
  );
} 