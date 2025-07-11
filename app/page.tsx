'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [joinPlayerName, setJoinPlayerName] = useState('');
  const router = useRouter();

  const handleJoinRoom = () => {
    if (!roomId.trim() || !joinPlayerName.trim()) {
      alert('ルームIDと名前を入力してください');
      return;
    }
    router.push(`/room/${roomId.toUpperCase()}?name=${encodeURIComponent(joinPlayerName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Connect4Plus</h1>
          <p className="text-gray-600">オンラインで2人対戦</p>
        </div>

        {/* メインカード */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">4</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">ゲームを開始</h2>
            <p className="text-gray-600 text-sm">新しいルームを作成して友達を招待</p>
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

            <Link
              href={`/room/create?name=${encodeURIComponent(playerName)}`}
              className={`w-full block text-center py-3 px-4 rounded-lg font-medium transition-colors ${
                playerName.trim()
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              ゲーム開始
            </Link>
          </div>
        </div>

        {/* 参加セクション */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ルームに参加</h3>
            <p className="text-gray-600 text-sm">友達から招待された場合</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                ルームID
              </label>
              <input
                type="text"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="ルームIDを入力"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="joinPlayerName" className="block text-sm font-medium text-gray-700 mb-2">
                あなたの名前
              </label>
              <input
                type="text"
                id="joinPlayerName"
                value={joinPlayerName}
                onChange={(e) => setJoinPlayerName(e.target.value)}
                placeholder="名前を入力"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button 
              onClick={handleJoinRoom}
              disabled={!roomId.trim() || !joinPlayerName.trim()}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                roomId.trim() && joinPlayerName.trim()
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              参加する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 