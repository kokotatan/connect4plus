'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ref, get, set, onValue, update } from 'firebase/database';
import { database } from '@/src/firebase';

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [roomData, setRoomData] = useState<any>(null);
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomId) return;

    // URLパラメータから名前を取得
    const nameFromUrl = searchParams.get('name');
    if (nameFromUrl) {
      setPlayerName(nameFromUrl);
    }

    // ルームデータを監視
    const roomRef = ref(database, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoomData(data);
        if (data.status === 'playing') {
          // ゲームが開始されている場合はゲーム画面に遷移
          router.push(`/game/${roomId}`);
        }
      } else {
        setError('ルームが見つかりません');
      }
    });

    return () => unsubscribe();
  }, [roomId, router, searchParams]);

  const joinRoom = async () => {
    if (!playerName.trim()) {
      alert('名前を入力してください');
      return;
    }

    setIsJoining(true);
    try {
      const roomRef = ref(database, `rooms/${roomId}`);
      const snapshot = await get(roomRef);
      
      if (!snapshot.exists()) {
        setError('ルームが見つかりません');
        return;
      }

      const room = snapshot.val();
      
      // プレイヤーが既に2人いる場合
      if (room.players.player1 && room.players.player2) {
        setError('このルームは既に満員です');
        return;
      }

      // プレイヤー2として参加
      const playerKey = room.players.player1 ? 'player2' : 'player1';
      const updates: any = {};
      updates[`rooms/${roomId}/players/${playerKey}`] = {
        name: playerName,
        joinedAt: Date.now()
      };

      // 2人揃った場合はゲーム開始
      if (playerKey === 'player2') {
        updates[`rooms/${roomId}/status`] = 'playing';
      }

      await update(ref(database), updates);

      setIsWaiting(true);
    } catch (error) {
      console.error('ルーム参加エラー:', error);
      setError('ルームへの参加に失敗しました');
    } finally {
      setIsJoining(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">エラー</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">参加完了</h2>
          <p className="text-gray-600 mb-4">他のプレイヤーの参加を待っています...</p>
          <p className="text-sm text-gray-500">ルームID: <span className="font-mono font-bold">{roomId}</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">ルームに参加</h1>
          <p className="text-gray-600">ルームID: <span className="font-mono font-bold text-blue-600">{roomId}</span></p>
        </div>

        {/* 参加フォーム */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">プレイヤー情報</h2>
            <p className="text-gray-600 text-sm">あなたの名前を入力してください</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
                あなたの名前
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="名前を入力"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={joinRoom}
              disabled={isJoining || !playerName.trim()}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                playerName.trim() && !isJoining
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isJoining ? '参加中...' : '参加する'}
            </button>
          </div>

          {roomData && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">参加プレイヤー</h3>
              <div className="space-y-2">
                {roomData.players.player1 && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">{roomData.players.player1.name}</span>
                  </div>
                )}
                {roomData.players.player2 && (
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">{roomData.players.player2.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 