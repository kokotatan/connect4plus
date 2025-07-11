'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ref, set, push } from 'firebase/database';
import { database } from '../../../src/firebase';

export default function CreateRoomPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(true);
  const [inviteUrl, setInviteUrl] = useState('');

  useEffect(() => {
    const playerName = searchParams.get('name');
    if (!playerName) {
      router.push('/');
      return;
    }

    createRoom(playerName);
  }, [searchParams, router]);

  const createRoom = async (playerName: string) => {
    try {
      // ルームIDを生成（6文字のランダム文字列）
      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Firebaseにルームデータを保存
      const roomRef = ref(database, `rooms/${newRoomId}`);
      await set(roomRef, {
        createdAt: Date.now(),
        status: 'waiting',
        players: {
          player1: {
            name: playerName,
            joinedAt: Date.now()
          }
        },
        currentTurn: 'player1',
        gameState: {
          board: Array(6).fill(null).map(() => Array(7).fill(null)),
          winner: null,
          isGameOver: false
        }
      });

      setRoomId(newRoomId);
      setInviteUrl(`${window.location.origin}/room/${newRoomId}`);
      setIsCreating(false);
    } catch (error) {
      console.error('ルーム作成エラー:', error);
      alert('ルームの作成に失敗しました。');
      router.push('/');
    }
  };

  const copyInviteUrl = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      alert('招待URLをコピーしました！');
    } catch (error) {
      console.error('コピーエラー:', error);
    }
  };

  const startGame = () => {
    router.push(`/room/${roomId}`);
  };

  if (isCreating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">ルームを作成中...</h2>
          <p className="text-gray-600">しばらくお待ちください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ルーム作成完了</h1>
          <p className="text-gray-600">友達を招待してゲームを開始</p>
        </div>

        {/* ルーム情報カード */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">ルームが作成されました</h2>
            <p className="text-gray-600 text-sm">ルームID: <span className="font-mono font-bold text-blue-600">{roomId}</span></p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                招待URL
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg bg-gray-50"
                />
                <button
                  onClick={copyInviteUrl}
                  className="px-4 py-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
                >
                  コピー
                </button>
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
            >
              ゲームを開始
            </button>
          </div>
        </div>

        {/* 説明カード */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">使い方</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
              <p>招待URLを友達に送信</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
              <p>友達が参加するまで待機</p>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
              <p>2人が揃ったらゲーム開始</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 