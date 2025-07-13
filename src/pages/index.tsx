import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const [player1Name, setPlayer1Name] = useState('');
  const [roomId, setRoomId] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const router = useRouter();

  // アバター画像パス
  const graycatMuscle = '/assets/Avater/PosingAvater/graycat_muscle.png';
  const graycatTraining = '/assets/Avater/PosingAvater/graycat_training.png';
  const tigerMuscle = '/assets/Avater/PosingAvater/tiger_muscle.png';
  const tigerTraining = '/assets/Avater/PosingAvater/tiger_training.png';

  const handleCreateRoom = () => {
    if (player1Name.trim()) {
      // ルーム作成画面に遷移
      router.push('/roomBuilding');
    }
  };

  const handleJoinRoom = () => {
    if (roomId.trim() && player2Name.trim()) {
      // 仮実装: ルームIDが'KAKOTA'なら存在、他は存在しない
      if (roomId.trim() === 'KAKOTA') {
        router.push(`/waitingForOpponent?roomId=${roomId.trim()}&player2Name=${player2Name.trim()}`);
      } else {
        alert('ルームが存在していません。');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-emerald-100 to-white flex flex-col justify-center items-center font-noto py-6 px-2">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <div className="mb-2">
          <h1 className="text-4xl font-extrabold text-black text-center tracking-tight drop-shadow-sm">connect4plus</h1>
          <p className="text-lg text-gray-500 font-semibold text-center mt-1">次世代方立体四目並べ</p>
        </div>

        {/* 新規ルーム作成カード */}
        <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 rounded-3xl shadow-xl py-10 px-7 w-full flex flex-col items-center gap-6">
          <p className="text-lg text-black font-bold text-center">新規でルームを作成する方はこちら</p>
          <div className="w-full flex flex-col items-center gap-2">
            <label className="block w-full text-lg font-bold text-gray-800 text-center mb-1">名前を入力してください。</label>
            <div className="flex w-full justify-between items-end mb-2">
              <img src={graycatMuscle} alt="User 1" className="w-28 h-32 object-contain -ml-2" />
              <img src={graycatTraining} alt="User 1 Training" className="w-20 h-20 object-contain -mr-2" />
            </div>
            <input
              type="text"
              value={player1Name}
              onChange={(e) => setPlayer1Name(e.target.value)}
              placeholder="User 1"
              className="w-full max-w-xs h-12 bg-gray-50 rounded-xl border-2 border-gray-200 px-4 text-lg font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition placeholder-gray-400 mb-2"
            />
            <button
              onClick={handleCreateRoom}
              disabled={!player1Name.trim()}
              className="w-full max-w-xs h-12 bg-gradient-to-r from-lime-400 to-emerald-400 text-white text-lg font-extrabold tracking-wide rounded-xl shadow hover:scale-105 active:scale-95 hover:from-lime-500 hover:to-emerald-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-md"
            >
              ルームを作成する。
            </button>
          </div>
        </div>

        {/* 既存ルーム参加カード */}
        <div className="bg-gradient-to-br from-white via-emerald-50 to-emerald-100 rounded-3xl shadow-xl py-10 px-7 w-full flex flex-col items-center gap-6">
          <p className="text-lg text-black font-bold text-center">既存のルームに参加する方はこちら</p>
          <div className="w-full flex flex-col items-center gap-2">
            <label className="block w-full text-lg font-bold text-gray-800 text-center mb-1">ルームIDを入力してください。</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="RoomID"
              className="w-full max-w-xs h-12 bg-gray-50 rounded-xl border-2 border-gray-200 px-4 text-base font-semibold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition placeholder-gray-400 mb-2"
            />
            <label className="block w-full text-lg font-bold text-gray-800 text-center mb-1">名前を入力してください。</label>
            <div className="flex w-full justify-between items-end mb-2">
              <img src={tigerMuscle} alt="User 2" className="w-28 h-32 object-contain -ml-2" />
              <img src={tigerTraining} alt="User 2 Training" className="w-20 h-20 object-contain -mr-2" />
            </div>
            <input
              type="text"
              value={player2Name}
              onChange={(e) => setPlayer2Name(e.target.value)}
              placeholder="User 2"
              className="w-full max-w-xs h-12 bg-gray-50 rounded-xl border-2 border-gray-200 px-4 text-lg font-bold focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition placeholder-gray-400 mb-2"
            />
            <button
              onClick={handleJoinRoom}
              disabled={!roomId.trim() || !player2Name.trim()}
              className="w-full max-w-xs h-12 bg-gradient-to-r from-lime-400 to-emerald-400 text-white text-lg font-extrabold tracking-wide rounded-xl shadow hover:scale-105 active:scale-95 hover:from-lime-500 hover:to-emerald-500 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-md"
            >
              ゲームに参加する。
            </button>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-500 text-base font-semibold mb-4 mt-8 select-none">
        Presented by Kotaro Design Lab.
      </div>
    </div>
  );
} 