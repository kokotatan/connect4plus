import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { joinRoom, checkRoomExists } from '../utils/firebase';

const tigerMuscle = '/assets/Avater/PosingAvater/tiger_muscle.png';
const tigerTraining = '/assets/Avater/PosingAvater/tiger_training.png';

export default function JoinRoomScreen() {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { roomId: urlRoomId } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    if (!urlRoomId || typeof urlRoomId !== 'string') {
      router.replace('/');
      return;
    }
    setRoomId(urlRoomId);
  }, [router.isReady, urlRoomId, router]);

  const handleJoinGame = async () => {
    if (playerName.trim() && roomId) {
      setIsLoading(true);
      setError('');
      try {
        // ルームの存在確認
        const roomExists = await checkRoomExists(roomId);
        if (!roomExists) {
          setError('ルームが見つかりません。ルームIDを確認してください。');
          setIsLoading(false);
          return;
        }

        // ルームに参加
        await joinRoom(roomId, playerName.trim());
        console.log('ルーム参加完了:', { roomId, playerName: playerName.trim() });
        
        // waitingForOpponentページに遷移
        router.push(`/waitingForOpponent?roomId=${roomId}&player2Name=${encodeURIComponent(playerName.trim())}`);
      } catch (error) {
        console.error('ルーム参加エラー:', error);
        setError('ルーム参加に失敗しました。もう一度お試しください。');
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleJoinGame();
    }
  };

  if (!roomId) {
    return (
      <Layout>
        <div className="w-full flex flex-col items-center mb-4 mt-2">
          <h2 className="text-2xl font-semibold text-black text-center leading-snug mb-1">読み込み中...</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* タイトル・サブタイトル */}
      <div className="w-full flex flex-col items-center mb-4 mt-2">
        <h2 className="text-2xl font-semibold text-black text-center leading-snug mb-1">ルーム参加</h2>
      </div>
      {/* メインカード */}
      <div className="bg-white rounded-2xl shadow-lg w-80 flex flex-col items-center px-6 py-6 mb-4">
        {/* ルームID表示 */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-gray-500 text-xs font-semibold leading-snug">ルームID:</span>
          <span className="text-blue-500 text-xs font-semibold leading-snug">{roomId}</span>
        </div>
        {/* アバター */}
        <div className="flex items-end justify-center gap-4 mb-4">
          <img src={tigerMuscle} alt="User 2" className="w-24 h-32 object-contain" />
          <img src={tigerTraining} alt="User 2 Training" className="w-20 h-20 object-contain" />
        </div>
        {/* 名前入力ラベル */}
        <label className="block w-full text-xs font-semibold text-black text-center mb-1">名前を入力してください。</label>
        {/* 名前入力フィールド */}
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="User 2"
          disabled={isLoading}
          className="w-full h-10 bg-gray-50 rounded-xl border-2 border-gray-200 px-4 text-base font-semibold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition placeholder-gray-400 mb-4 disabled:opacity-50"
        />
        {/* エラーメッセージ */}
        {error && (
          <div className="w-full text-red-500 text-xs text-center mb-4">
            {error}
          </div>
        )}
        {/* ゲーム参加ボタン */}
        <button
          onClick={handleJoinGame}
          disabled={!playerName.trim() || isLoading}
          className={`w-full h-10 rounded-xl flex items-center justify-center transition-all text-white text-sm font-semibold
            ${playerName.trim() && !isLoading
              ? 'bg-gradient-to-r from-lime-400 to-emerald-400 shadow hover:from-lime-500 hover:to-emerald-500'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          {isLoading ? '参加中...' : 'ゲームに参加する。'}
        </button>
      </div>
      
    </Layout>
  );
} 